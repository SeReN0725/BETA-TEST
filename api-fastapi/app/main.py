
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from math import isfinite
import os
import numpy as np

# 딥러닝 모델 관련 모듈 임포트
from app.models import Student, TeamData
from app.data_processor import extract_student_features, prepare_training_data, save_team_data, load_team_data
from app.deep_matching import DeepMatchingModel, train_model, load_model, greedy_match_with_model

app = FastAPI(title="NeXeed AI Service", version="0.2.0")

# API Key Authentication
API_KEY = os.getenv("API_KEY", "nexeed-ai-key-2024")

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

# 딥러닝 모델 초기화
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODEL_PATH, exist_ok=True)
DEEP_MODEL = None

# 모델 로드 시도
try:
    DEEP_MODEL = load_model(os.path.join(MODEL_PATH, "team_matching_model"))
    if DEEP_MODEL is not None:
        print("딥러닝 모델 로드 성공")
    else:
        print("딥러닝 모델이 없습니다. 기본 그리디 알고리즘을 사용합니다.")
except Exception as e:
    print("딥러닝 모델이 없습니다. 기본 그리디 알고리즘을 사용합니다.")
    print("새 모델이 필요할 경우 /match/train 엔드포인트를 사용하세요.")

# ----- Scoring -----

REVERSE = {
    "O": {1,6},     # 개방성: 1번, 6번 역문항
    "C": {9,11,12}, # 성실성: 9번, 11번, 12번 역문항
    "E": {13,16,18}, # 외향성: 13번, 16번, 18번 역문항
    "A": {21,23},   # 우호성: 21번, 23번 역문항
    "N": {26,28}    # 신경성: 26번, 28번 역문항
}

class ScoreRequest(BaseModel):
    answers: Dict[str, int] = Field(..., description="Q1..Q30 → 1..5 or 1..7")
    scale: int = Field(5, description="Likert max (5 or 7)")

class OCEAN(BaseModel):
    O: float; C: float; E: float; A: float; N: float

def reverse_code(x:int, scale:int) -> int:
    return (scale + 1) - x

def to_01(avg: float, scale:int) -> float:
    return round((avg - 1.0) / (scale - 1.0), 4)

@app.post("/score/bigfive", response_model=OCEAN)
def score_bigfive(req: ScoreRequest):
    if req.scale not in (5,7):
        raise HTTPException(400, "scale must be 5 or 7")
    groups = {"O":[], "C":[], "E":[], "A":[], "N":[]}
    for i in range(1,31):
        key = f"Q{i}"
        if key not in req.answers:
            raise HTTPException(400, f"Missing {key}")
        v = req.answers[key]
        if not (1 <= v <= req.scale):
            raise HTTPException(400, f"{key} out of range")
        if i in REVERSE["O"]|REVERSE["C"]|REVERSE["E"]|REVERSE["A"]|REVERSE["N"]:
            # find which trait it belongs to
            trait = next(t for t, s in REVERSE.items() if i in s)
            # overwrite v reversed but also ensure trait mapping by i
        # map i→trait
        if   1<=i<=6:  trait="O"
        elif 7<=i<=12: trait="C"
        elif 13<=i<=18:trait="E"
        elif 19<=i<=24:trait="A"
        else:          trait="N"
        if i in REVERSE[trait]:
            v = reverse_code(v, req.scale)
        groups[trait].append(v)
    out = {}
    for t, arr in groups.items():
        avg = sum(arr)/len(arr)
        out[t] = to_01(avg, req.scale)
    return OCEAN(**out)

# ----- Matching -----

from typing import Set
from itertools import combinations

# Student 클래스는 data_processor.py에서 임포트

class MatchRequest(BaseModel):
    team_size: int = 4
    required_roles: Dict[str,int] = {"PM":1,"FE":1,"BE":1,"Design":1}
    students: List[Student]

class MemberOut(BaseModel):
    student_id: str
    role_assigned: Optional[str] = None

class TeamOut(BaseModel):
    score: float
    members: List[MemberOut]
    reasons: List[str] = []

class MatchResponse(BaseModel):
    teams: List[TeamOut]

def clamp(x: float, lo=0.0, hi=1.0) -> float:
    return max(lo, min(hi, x))

def parse_slots(s: str) -> Set[str]:
    return set([t.strip() for t in s.split(";") if t.strip()]) if s else set()

def jaccard(a:Set[str], b:Set[str]) -> float:
    if not a and not b: return 0.0
    return len(a & b) / max(1, len(a | b))

W = {"C":0.30,"A":0.20,"E":0.15,"O":0.15,"N":0.10,"AVAIL":0.10}

def pair_score(a: Student, b: Student) -> float:
    # OCEAN 점수를 0-1 범위로 정규화 (10점 척도 기준)
    sC = 1 - abs(a.C - b.C) / 10.0
    sA = 1 - abs(a.A - b.A) / 10.0
    sE = 1 - abs(a.E - b.E) / 10.0
    sO = 1 - abs(a.O - b.O) / 10.0
    # 신경성은 낮을수록 좋으므로 평균을 10으로 나누어 정규화
    sN = 1 - ((a.N + b.N)/2.0) / 10.0
    sav = jaccard(parse_slots(a.availability), parse_slots(b.availability))
    base = (W["C"]*sC + W["A"]*sA + W["E"]*sE + W["O"]*sO + W["N"]*sN + W["AVAIL"]*sav)
    return clamp(base)

def team_internal_score(team: List[Student]) -> float:
    if len(team) < 2: return 0.0
    pairs = list(combinations(team, 2))
    return sum(pair_score(a,b) for a,b in pairs) / len(pairs)

def role_coverage_bonus(team: List[Student], req: Dict[str,int]) -> float:
    counts = {}
    for m in team:
        r = (m.role_pref or "Any").strip()
        counts[r] = counts.get(r,0)+1
    ok = 0; need = 0
    for r,rc in req.items():
        need += rc
        ok += min(counts.get(r,0), rc)
    return 0.1 * (ok / max(1, need))

def team_score(team: List[Student], req: Dict[str,int]) -> float:
    return round(team_internal_score(team) + role_coverage_bonus(team, req), 3)

def greedy_match(students: List[Student], team_size:int, req_roles: Dict[str,int]) -> List[List[Student]]:
    remaining = students[:]
    remaining.sort(key=lambda x: (x.role_pref=="PM", x.C), reverse=True)
    teams: List[List[Student]] = []
    
    # 첫 번째 패스: 기본 그리디 매칭
    while remaining:
        curr = [remaining.pop(0)]
        while len(curr) < team_size and remaining:
            best_i, best_gain = None, -1e9
            base = team_internal_score(curr)
            for i, cand in enumerate(remaining):
                sc = team_internal_score(curr+[cand]) - base
                # add small role coverage gain
                sc += role_coverage_bonus(curr+[cand], req_roles) - role_coverage_bonus(curr, req_roles)
                if sc > best_gain: best_gain, best_i = sc, i
            curr.append(remaining.pop(best_i))
        teams.append(curr)
    
    # 두 번째 패스: 팀 간 점수 균형 조정
    teams = balance_team_scores(teams, req_roles)
    return teams

def balance_team_scores(teams: List[List[Student]], req_roles: Dict[str,int]) -> List[List[Student]]:
    """팀 간 점수 균형을 맞추기 위한 멤버 교환"""
    if len(teams) < 2:
        return teams
    
    max_iterations = 50
    for iteration in range(max_iterations):
        # 각 팀의 점수 계산
        team_scores = [team_score(team, req_roles) for team in teams]
        
        # 점수 차이가 충분히 작으면 종료
        if max(team_scores) - min(team_scores) < 0.05:
            break
            
        # 가장 높은 점수 팀과 가장 낮은 점수 팀 찾기
        max_idx = team_scores.index(max(team_scores))
        min_idx = team_scores.index(min(team_scores))
        
        best_swap = None
        best_improvement = 0
        
        # 두 팀 간 멤버 교환 시도
        for i, member_high in enumerate(teams[max_idx]):
            for j, member_low in enumerate(teams[min_idx]):
                # 역할이 같은 멤버끼리만 교환
                if member_high.role_pref != member_low.role_pref:
                    continue
                    
                # 임시로 교환해보기
                temp_high = teams[max_idx][:]
                temp_low = teams[min_idx][:]
                temp_high[i] = member_low
                temp_low[j] = member_high
                
                # 새로운 점수 계산
                new_high_score = team_score(temp_high, req_roles)
                new_low_score = team_score(temp_low, req_roles)
                
                # 점수 차이 개선 정도 계산
                old_diff = abs(team_scores[max_idx] - team_scores[min_idx])
                new_diff = abs(new_high_score - new_low_score)
                improvement = old_diff - new_diff
                
                if improvement > best_improvement:
                    best_improvement = improvement
                    best_swap = (max_idx, min_idx, i, j)
        
        # 최적의 교환 실행
        if best_swap and best_improvement > 0.01:
            max_idx, min_idx, i, j = best_swap
            member_high = teams[max_idx][i]
            member_low = teams[min_idx][j]
            teams[max_idx][i] = member_low
            teams[min_idx][j] = member_high
        else:
            break
    
    return teams

@app.post("/match/run", response_model=MatchResponse)
def match_run(req: MatchRequest, api_key: str = Depends(verify_api_key)):
    if req.team_size < 2:
        raise HTTPException(400, "team_size must be >=2")
    studs = req.students
    teams = greedy_match(studs, req.team_size, req.required_roles)
    out = []
    for t in teams:
        sc = team_score(t, req.required_roles)
        out.append(TeamOut(
            score=sc,
            members=[MemberOut(student_id=m.student_id, role_assigned=m.role_pref) for m in t],
            reasons=[
                f"평균 C={round(sum(m.C for m in t)/len(t),3)}",
                f"가용시간 평균겹침≈{round(sum(jaccard(parse_slots(a.availability),parse_slots(b.availability)) for a,b in combinations(t,2))/max(1,len(t)*(len(t)-1)/2),3)}",
            ]
        ))
    return MatchResponse(teams=out)


@app.post("/match/run_deep", response_model=MatchResponse)
def match_run_deep(req: MatchRequest, api_key: str = Depends(verify_api_key)):
    """딥러닝 모델을 사용한 팀 매칭 실행"""
    if req.team_size < 2:
        raise HTTPException(400, "team_size must be >=2")
    
    # 딥러닝 모델 확인
    global DEEP_MODEL
    if DEEP_MODEL is None:
        raise HTTPException(503, "딥러닝 모델이 로드되지 않았습니다. /match/train 엔드포인트로 모델을 먼저 학습하세요.")
    
    studs = req.students
    
    # 딥러닝 모델을 사용한 팀 매칭
    teams = greedy_match_with_model(DEEP_MODEL, studs, req.team_size, req.required_roles)
    
    out = []
    for t in teams:
        # 딥러닝 모델 점수와 기존 점수 모두 계산
        deep_score = DEEP_MODEL.predict_team_compatibility(t)
        traditional_score = team_score(t, req.required_roles)
        
        # 최종 점수는 딥러닝 모델 점수 사용
        out.append(TeamOut(
            score=round(float(deep_score), 3),
            members=[MemberOut(student_id=m.student_id, role_assigned=m.role_pref) for m in t],
            reasons=[
                f"딥러닝 모델 점수={round(float(deep_score), 3)}",
                f"전통적 점수={round(traditional_score, 3)}",
                f"평균 C={round(sum(m.C for m in t)/len(t), 3)}",
                f"가용시간 평균겹침≈{round(sum(jaccard(parse_slots(a.availability),parse_slots(b.availability)) for a,b in combinations(t,2))/max(1,len(t)*(len(t)-1)/2), 3)}",
            ]
        ))
    
    return MatchResponse(teams=out)


class TrainRequest(BaseModel):
    """모델 학습 요청 스키마"""
    team_size: int = 4
    required_roles: Dict[str, int] = {"PM":1, "FE":1, "BE":1, "Design":1}
    students: List[Student]
    existing_teams: Optional[List[List[str]]] = None  # 기존 팀 구성 (학생 ID 리스트의 리스트)
    epochs: int = 50


class TrainResponse(BaseModel):
    """모델 학습 응답 스키마"""
    success: bool
    message: str
    metrics: Dict[str, float] = {}


@app.post("/match/train", response_model=TrainResponse)
def train_deep_model(req: TrainRequest, api_key: str = Depends(verify_api_key)):
    """딥러닝 모델 학습 엔드포인트"""
    global DEEP_MODEL
    
    try:
        # 학습 데이터 준비
        students = req.students
        
        # 기존 팀 정보가 있으면 사용, 없으면 기존 알고리즘으로 팀 생성
        if req.existing_teams:
            # 학생 ID로 팀 구성
            teams = []
            for team_ids in req.existing_teams:
                team = [s for s in students if s.student_id in team_ids]
                if len(team) > 0:
                    teams.append(team)
        else:
            # 기존 알고리즘으로 팀 생성
            teams = greedy_match(students, req.team_size, req.required_roles)
        
        # TeamData 객체 생성
        team_data = []
        for i, team in enumerate(teams):
            team_data.append(TeamData(
                team_id=f"team_{i}",
                members=team,
                performance_score=1.0,  # 기본 성과 점수 (실제 데이터로 대체 필요)
                success_rate=1.0
            ))
        
        # 학습 데이터 준비
        X_train, y_train = prepare_training_data(team_data)
        
        # 모델 초기화 또는 로드
        if DEEP_MODEL is None:
            DEEP_MODEL = DeepMatchingModel()
        
        # 모델 학습
        history = train_model(DEEP_MODEL, X_train, y_train, epochs=req.epochs)
        
        # 모델 저장
        model_path = os.path.join(MODEL_PATH, "team_matching_model")
        DEEP_MODEL.save(model_path)
        
        # 팀 데이터 저장 (추후 분석용)
        data_path = os.path.join(MODEL_PATH, "team_data.pkl")
        save_team_data(students, teams, data_path)
        
        # 학습 메트릭 반환
        metrics = {
            "final_loss": float(history.history["loss"][-1]),
            "final_accuracy": float(history.history["accuracy"][-1]) if "accuracy" in history.history else 0.0,
            "teams_count": len(teams),
            "students_count": len(students)
        }
        
        return TrainResponse(
            success=True,
            message="딥러닝 모델 학습 완료",
            metrics=metrics
        )
        
    except Exception as e:
        return TrainResponse(
            success=False,
            message=f"모델 학습 중 오류 발생: {str(e)}"
        )
