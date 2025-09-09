import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from app.models import Student, TeamData
import re

def convert_availability_format(availability: str) -> str:
    """데이터베이스의 가용시간 형식을 알고리즘 형식으로 변환
    
    Args:
        availability: "weekdays 9-18", "weekdays 10-19" 등의 형식
    
    Returns:
        "MonMorn;MonEve;TueMorn;TueEve;WedMorn;WedEve;ThuMorn;ThuEve;FriMorn;FriEve" 등의 형식
    """
    if not availability or availability.strip() == "":
        return ""
    
    # "weekdays 9-18" 형식 파싱
    weekdays_pattern = r"weekdays\s+(\d+)-(\d+)"
    match = re.match(weekdays_pattern, availability.strip())
    
    if not match:
        # 기존 형식이면 그대로 반환
        return availability
    
    start_hour = int(match.group(1))
    end_hour = int(match.group(2))
    
    # 시간대별 슬롯 생성
    time_slots = []
    weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    
    for day in weekdays:
        # 오전 시간대 (9-12시)
        if start_hour <= 12 and end_hour > 9:
            time_slots.append(f"{day}Morn")
        
        # 오후/저녁 시간대 (13-20시)
        if start_hour <= 20 and end_hour > 13:
            time_slots.append(f"{day}Eve")
    
    return ";".join(time_slots)

def extract_student_features(student: Student) -> np.ndarray:
    """학생 객체에서 특성 벡터 추출"""
    # OCEAN 점수를 특성으로 사용
    ocean_features = np.array([student.O, student.C, student.E, student.A, student.N])
    
    # 역할 선호도를 원-핫 인코딩으로 변환
    role_map = {"PM": 0, "FE": 1, "BE": 2, "Design": 3, "Any": 4}
    role_idx = role_map.get(student.role_pref, 4)  # 기본값은 "Any"
    role_features = np.zeros(5)
    role_features[role_idx] = 1
    
    # 가용 시간 처리 (시간대를 비트 벡터로 변환)
    # 데이터베이스 형식을 알고리즘 형식으로 변환
    converted_availability = convert_availability_format(student.availability)
    time_slots = converted_availability.split(";") if converted_availability else []
    time_map = {"MonMorn": 0, "MonEve": 1, "TueMorn": 2, "TueEve": 3, 
               "WedMorn": 4, "WedEve": 5, "ThuMorn": 6, "ThuEve": 7,
               "FriMorn": 8, "FriEve": 9, "SatMorn": 10, "SatEve": 11,
               "SunMorn": 12, "SunEve": 13}
    time_features = np.zeros(14)
    for slot in time_slots:
        if slot in time_map:
            time_features[time_map[slot]] = 1
    
    # 모든 특성 결합
    return np.concatenate([ocean_features, role_features, time_features])

def prepare_pair_data(students: List[Student]) -> Tuple[np.ndarray, List[Tuple[int, int]]]:
    """학생 쌍 데이터 준비"""
    features = np.array([extract_student_features(s) for s in students])
    pairs = [(i, j) for i in range(len(students)) for j in range(i+1, len(students))]
    return features, pairs

def create_pair_features(features: np.ndarray, pair: Tuple[int, int]) -> np.ndarray:
    """학생 쌍의 특성 벡터 생성"""
    i, j = pair
    # 두 학생의 특성 차이와 합을 계산
    diff = np.abs(features[i] - features[j])
    summ = features[i] + features[j]
    # 특성 결합
    return np.concatenate([features[i], features[j], diff, summ])

def prepare_training_data(teams: List[TeamData]) -> Tuple[np.ndarray, np.ndarray]:
    """모델 학습을 위한 데이터 준비"""
    X = []  # 특성 벡터
    y = []  # 레이블 (팀 성과)
    
    for team in teams:
        # 팀 내 모든 학생 쌍에 대한 특성 추출
        features, pairs = prepare_pair_data(team.members)
        for pair in pairs:
            X.append(create_pair_features(features, pair))
            y.append(team.performance_score)  # 팀 성과 점수를 레이블로 사용
    
    return np.array(X), np.array(y)

def save_team_data(team_data: List[TeamData], file_path: str = "team_data.csv"):
    """팀 데이터를 CSV 파일로 저장"""
    rows = []
    for team in team_data:
        for member in team.members:
            rows.append({
                "team_id": team.team_id,
                "student_id": member.student_id,
                "name": member.name,
                "major": member.major,
                "role_pref": member.role_pref,
                "O": member.O,
                "C": member.C,
                "E": member.E,
                "A": member.A,
                "N": member.N,
                "availability": member.availability,
                "performance_score": team.performance_score,
                "success_rate": team.success_rate
            })
    
    df = pd.DataFrame(rows)
    df.to_csv(file_path, index=False)
    return f"데이터가 {file_path}에 저장되었습니다."

def load_team_data(file_path: str = "team_data.csv") -> List[TeamData]:
    """CSV 파일에서 팀 데이터 로드"""
    try:
        df = pd.read_csv(file_path)
        team_data = {}
        
        for _, row in df.iterrows():
            team_id = row["team_id"]
            if team_id not in team_data:
                team_data[team_id] = {
                    "members": [],
                    "performance_score": row["performance_score"],
                    "success_rate": row["success_rate"]
                }
            
            student = Student(
                student_id=row["student_id"],
                name=row["name"],
                major=row["major"],
                role_pref=row["role_pref"],
                availability=row["availability"],
                O=row["O"],
                C=row["C"],
                E=row["E"],
                A=row["A"],
                N=row["N"]
            )
            team_data[team_id]["members"].append(student)
        
        return [
            TeamData(
                team_id=team_id,
                members=data["members"],
                performance_score=data["performance_score"],
                success_rate=data["success_rate"]
            ) for team_id, data in team_data.items()
        ]
    except Exception as e:
        print(f"데이터 로드 중 오류 발생: {e}")
        return []