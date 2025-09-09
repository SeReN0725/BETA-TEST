from pydantic import BaseModel
from typing import List, Optional

class Student(BaseModel):
    """학생 정보 모델"""
    student_id: str
    name: Optional[str] = None
    major: Optional[str] = None
    skills: Optional[str] = ""
    MBTI: Optional[str] = None
    role_pref: str = "Any"
    availability: str = ""  # "MonEve;WedEve"
    O: float
    C: float
    E: float
    A: float
    N: float

class TeamData(BaseModel):
    """팀 데이터 모델 - 학습 데이터로 사용"""
    team_id: str
    members: List[Student]
    performance_score: float = 0.0  # 팀 성과 점수 (나중에 피드백으로 수집)
    success_rate: float = 0.0      # 팀 성공률