import tensorflow as tf
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import os
import json
from datetime import datetime
from app.models import Student
from app.data_processor import extract_student_features, create_pair_features, prepare_pair_data

# 모델 저장 경로
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "team_matching_model")

class DeepMatchingModel(tf.keras.Model):
    """학생 쌍의 호환성을 예측하는 딥러닝 모델"""
    
    def __init__(self, input_dim: int = 48):
        super(DeepMatchingModel, self).__init__()
        self.dense1 = tf.keras.layers.Dense(64, activation='relu')
        self.dropout1 = tf.keras.layers.Dropout(0.3)
        self.dense2 = tf.keras.layers.Dense(32, activation='relu')
        self.dropout2 = tf.keras.layers.Dropout(0.3)
        self.output_layer = tf.keras.layers.Dense(1)  # 회귀 문제이므로 활성화 함수 제거
        
        # 모델 입력 형태 정의
        self.build(input_shape=(None, input_dim))
    
    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        if training:
            x = self.dropout1(x)
        x = self.dense2(x)
        if training:
            x = self.dropout2(x)
        return self.output_layer(x)
    
    def predict_team_compatibility(self, team: List[Student]) -> float:
        """팀의 전체 호환성 점수 예측"""
        if len(team) < 2:
            return 0.0
            
        # 학생 특성 추출
        features, pairs = prepare_pair_data(team)
        
        # 모든 쌍에 대한 특성 벡터 생성
        pair_features = np.array([create_pair_features(features, pair) for pair in pairs])
        
        # 호환성 점수 예측
        compatibility_scores = self.predict(pair_features).flatten()
        
        # 평균 호환성 점수 반환
        return float(np.mean(compatibility_scores))
        
    def save(self, path: str):
        """모델 저장 - 전체 모델 구조 포함"""
        tf.keras.models.save_model(self, path)

def create_model(input_dim: int) -> DeepMatchingModel:
    """호환성 예측 모델 생성"""
    model = DeepMatchingModel(input_dim)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='mean_squared_error',  # 회귀 문제에 맞는 손실함수
        metrics=['mae']  # 평균 절대 오차로 변경
    )
    return model

def train_model(model: DeepMatchingModel, X: np.ndarray, y: np.ndarray, epochs: int = 20, batch_size: int = 32) -> tf.keras.callbacks.History:
    """모델 학습"""
    # 모델 학습
    history = model.fit(
        X, y,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
        ]
    )
    
    # 모델 저장
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
    model.save(MODEL_PATH)
    
    return history

def load_model(model_path: str = MODEL_PATH) -> Optional[DeepMatchingModel]:
    """저장된 모델 로드"""
    try:
        # 모델 파일이 존재하는지 먼저 확인
        if not os.path.exists(model_path):
            return None
            
        # 전체 모델 로드
        model = tf.keras.models.load_model(model_path)
        
        # DeepMatchingModel 타입으로 변환
        if isinstance(model, tf.keras.Model):
            # 기존 모델의 가중치를 새 DeepMatchingModel에 복사
            new_model = DeepMatchingModel()
            new_model.build(input_shape=(None, 48))
            new_model.set_weights(model.get_weights())
            new_model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                loss='mean_squared_error',
                metrics=['mae']
            )
            return new_model
        return model
    except Exception as e:
        print(f"모델 로드 실패: {e}")
        return None

def predict_compatibility(model: DeepMatchingModel, students: List[Student]) -> np.ndarray:
    """모든 학생 쌍의 호환성 점수 예측"""
    # 학생 특성 추출
    features, pairs = prepare_pair_data(students)
    
    # 모든 쌍에 대한 특성 벡터 생성
    pair_features = np.array([create_pair_features(features, pair) for pair in pairs])
    
    # 호환성 점수 예측
    compatibility_scores = model.predict(pair_features).flatten()
    
    # 호환성 행렬 생성 (n x n 행렬, 대각선은 1.0)
    n = len(students)
    compatibility_matrix = np.ones((n, n))
    
    # 예측된 호환성 점수로 행렬 채우기
    for (i, j), score in zip(pairs, compatibility_scores):
        compatibility_matrix[i, j] = score
        compatibility_matrix[j, i] = score  # 대칭 행렬
    
    return compatibility_matrix

def greedy_match_with_model(model: DeepMatchingModel, students: List[Student], team_size: int, req_roles: Dict[str, int]) -> List[List[Student]]:
    """딥러닝 모델을 사용한 팀 매칭 알고리즘"""
    if len(students) < team_size:
        return [students]  # 학생 수가 팀 크기보다 작으면 모두 한 팀으로
    
    # 호환성 점수 예측
    compatibility_matrix = predict_compatibility(model, students)
    
    # 팀 구성 알고리즘 (그리디 접근법)
    remaining = list(range(len(students)))
    teams = []
    
    # 역할 선호도 기반 정렬 (PM 우선)
    role_priority = {"PM": 0, "FE": 1, "BE": 2, "Design": 3, "Any": 4}
    remaining.sort(key=lambda i: (role_priority.get(students[i].role_pref, 4), -students[i].C))
    
    while remaining:
        # 새 팀 시작
        curr_team = [remaining.pop(0)]  # 첫 번째 학생으로 시작
        
        # 팀 완성
        while len(curr_team) < team_size and remaining:
            # 현재 팀과 가장 호환성이 높은 학생 찾기
            best_idx, best_score = -1, -1
            for i, student_idx in enumerate(remaining):
                # 현재 팀원들과의 평균 호환성 계산
                avg_score = sum(compatibility_matrix[student_idx, team_idx] for team_idx in curr_team) / len(curr_team)
                
                # 역할 커버리지 보너스 계산
                role_bonus = 0
                if students[student_idx].role_pref in req_roles:
                    # 현재 팀의 역할 카운트
                    role_counts = {}
                    for idx in curr_team:
                        role = students[idx].role_pref
                        role_counts[role] = role_counts.get(role, 0) + 1
                    
                    # 필요한 역할이고 아직 충족되지 않았으면 보너스
                    role = students[student_idx].role_pref
                    if role_counts.get(role, 0) < req_roles.get(role, 0):
                        role_bonus = 0.1
                
                # 최종 점수 = 호환성 + 역할 보너스
                score = avg_score + role_bonus
                
                if score > best_score:
                    best_idx, best_score = i, score
            
            # 가장 좋은 학생 추가
            if best_idx >= 0:
                curr_team.append(remaining.pop(best_idx))
            else:
                break
        
        # 팀 추가
        teams.append([students[idx] for idx in curr_team])
    
    return teams

def calculate_team_score(team: List[Student], compatibility_matrix: np.ndarray, req_roles: Dict[str, int]) -> float:
    """팀 점수 계산"""
    if len(team) < 2:
        return 0.0
    
    # 팀 내 모든 쌍의 호환성 평균
    team_indices = [i for i, _ in enumerate(team)]
    pairs = [(i, j) for i in team_indices for j in team_indices if i < j]
    avg_compatibility = sum(compatibility_matrix[i, j] for i, j in pairs) / len(pairs)
    
    # 역할 커버리지 보너스
    role_counts = {}
    for student in team:
        role = student.role_pref
        role_counts[role] = role_counts.get(role, 0) + 1
    
    role_coverage = 0
    total_required = 0
    for role, count in req_roles.items():
        total_required += count
        role_coverage += min(role_counts.get(role, 0), count)
    
    role_bonus = 0.1 * (role_coverage / max(1, total_required))
    
    return round(avg_compatibility + role_bonus, 3)
