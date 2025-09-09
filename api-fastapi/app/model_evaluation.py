import os
import numpy as np
import matplotlib.pyplot as plt
import pickle
from typing import List, Dict, Tuple, Any
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from app.data_processor import extract_student_features, prepare_training_data, load_team_data
from app.deep_matching import DeepMatchingModel, train_model, load_model


def evaluate_model(model: DeepMatchingModel, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
    """모델 성능 평가"""
    # 예측 수행
    y_pred = model.predict(X_test)
    
    # 평가 지표 계산
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    return {
        "mse": float(mse),
        "mae": float(mae),
        "r2": float(r2),
        "rmse": float(np.sqrt(mse))
    }


def cross_validate(students: List, teams: List[List], test_size: float = 0.2, epochs: int = 50) -> Dict[str, Any]:
    """교차 검증 수행"""
    # 학습 데이터 준비
    X, y = prepare_training_data(students, teams)
    
    # 학습/테스트 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
    
    # 모델 초기화 및 학습
    model = DeepMatchingModel()
    history = train_model(model, X_train, y_train, epochs=epochs, validation_data=(X_test, y_test))
    
    # 모델 평가
    metrics = evaluate_model(model, X_test, y_test)
    
    return {
        "model": model,
        "history": history,
        "metrics": metrics,
        "test_data": (X_test, y_test)
    }


def plot_learning_curves(history, save_path: str = None):
    """학습 곡선 시각화"""
    plt.figure(figsize=(12, 5))
    
    # 손실 그래프
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    if 'val_loss' in history.history:
        plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Loss Curves')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    # 정확도 그래프 (있는 경우)
    plt.subplot(1, 2, 2)
    if 'accuracy' in history.history:
        plt.plot(history.history['accuracy'], label='Training Accuracy')
    if 'val_accuracy' in history.history:
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Accuracy Curves')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path)
        return save_path
    else:
        plt.show()
    
    return None


def compare_models(traditional_scores: List[float], deep_scores: List[float], true_scores: List[float] = None):
    """전통적 알고리즘과 딥러닝 모델 비교"""
    plt.figure(figsize=(10, 6))
    
    x = np.arange(len(traditional_scores))
    width = 0.35
    
    plt.bar(x - width/2, traditional_scores, width, label='Traditional Algorithm')
    plt.bar(x + width/2, deep_scores, width, label='Deep Learning Model')
    
    if true_scores:
        plt.plot(x, true_scores, 'r--', label='True Scores')
    
    plt.xlabel('Team Index')
    plt.ylabel('Compatibility Score')
    plt.title('Team Compatibility Score Comparison')
    plt.legend()
    
    plt.tight_layout()
    plt.show()


def save_evaluation_results(results: Dict[str, Any], file_path: str):
    """평가 결과 저장"""
    # 모델 객체 제거 (저장 불가)
    results_copy = results.copy()
    if 'model' in results_copy:
        del results_copy['model']
    
    # 히스토리 객체 처리
    if 'history' in results_copy:
        results_copy['history'] = {
            'loss': results_copy['history'].history['loss'],
            'val_loss': results_copy['history'].history.get('val_loss', []),
            'accuracy': results_copy['history'].history.get('accuracy', []),
            'val_accuracy': results_copy['history'].history.get('val_accuracy', [])
        }
    
    # 결과 저장
    with open(file_path, 'wb') as f:
        pickle.dump(results_copy, f)


def load_evaluation_results(file_path: str) -> Dict[str, Any]:
    """평가 결과 로드"""
    with open(file_path, 'rb') as f:
        return pickle.load(f)


def run_full_evaluation(data_path: str, model_path: str, output_dir: str, epochs: int = 50):
    """전체 평가 프로세스 실행"""
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # 데이터 로드
    students, teams = load_team_data(data_path)
    
    # 교차 검증 수행
    cv_results = cross_validate(students, teams, epochs=epochs)
    
    # 학습 곡선 저장
    curve_path = os.path.join(output_dir, 'learning_curves.png')
    plot_learning_curves(cv_results['history'], save_path=curve_path)
    
    # 평가 결과 저장
    results_path = os.path.join(output_dir, 'evaluation_results.pkl')
    save_evaluation_results(cv_results, results_path)
    
    # 모델 저장
    cv_results['model'].save(model_path)
    
    return cv_results['metrics']