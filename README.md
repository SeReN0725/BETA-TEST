
# NeXeed Capstone Auto-Matching System

> 캡스톤 프로젝트를 위한 자동 팀 매칭 시스템 - Big Five 성격 검사와 AI 기반 매칭 알고리즘을 활용한 최적의 팀 구성

## 🏗️ 시스템 구성

### 서비스 아키텍처

| 서비스 | 포트 | 역할 | 주요 기능 |
|--------|------|------|----------|
| **[AI 서비스](./api-fastapi/README.md)** | 8001 | 머신러닝 엔진 | Big Five 분석, 딥러닝 매칭, 모델 학습 |
| **[백엔드 API](./server-express/README.md)** | 8080 | 데이터 관리 | 사용자 관리, 매칭 오케스트레이션, API 게이트웨이 |
| **[프론트엔드](./web-nextjs/README.md)** | 3000 | 사용자 인터페이스 | Big Five 설문, 반응형 UI, 사용자 경험 |
| **데이터베이스** | 5432 | 데이터 저장소 | PostgreSQL, 사용자/매칭 데이터 관리 |

### 주요 기능
- 📊 Big Five 성격 검사 (30문항)
- 🤖 AI 기반 팀 매칭 알고리즘
- 👥 코호트별 사용자 관리
- ⏰ 시간표 기반 매칭 최적화
- 🎯 역할 기반 팀 구성
- 📈 매칭 결과 분석 및 시각화



## 🚀 Quick Start

### 📋 사전 요구사항
- **Node.js** (v16 이상)
- **Python** (v3.8 이상)
- **Docker** (데이터베이스용)
- **Git** (코드 다운로드용)

### 📥 설치 및 실행

#### 1. 프로젝트 다운로드
```bash
# 방법 1: Git으로 다운로드 (추천)
git clone <repository-url>
cd BETA_TEST

# 방법 2: ZIP 파일로 다운로드
# GitHub에서 "Code" > "Download ZIP" 클릭 후 압축 해제
# 또는 직접 BETA_TEST 폴더 전체를 복사
```

#### 2. Docker Compose로 모든 서비스 실행 (추천)
```bash
# 모든 서비스를 한 번에 실행
docker compose up -d

# 로그 확인
docker compose logs -f
```

#### 3. 개별 서비스 실행 (개발 시)

##### 3.1. 데이터베이스 실행
```bash
docker compose up -d db
```

##### 3.2. AI 서비스 실행 (포트: 8001)
```bash
cd api-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

##### 3.3. 백엔드 API 실행 (포트: 8080)
```bash
cd server-express
cp .env.example .env   # 환경변수 설정 확인
npm install
node src/index.js
```

##### 3.4. 프론트엔드 실행 (포트: 3000)
```bash
cd web-nextjs
npm install
npm run dev
```

### 5. 시스템 사용
1. **설문 참여**: http://localhost:3000 접속
2. **관리자 인터페이스**: http://localhost:8080/admin 접속
3. **매칭 실행**: 관리자 인터페이스에서 팀 매칭 실행
4. **결과 확인**: 웹 인터페이스를 통해 매칭 결과 조회

## 📋 관리자 기능

### 🖥️ 관리자 웹 인터페이스
- **대시보드**: 시스템 전체 현황 및 통계
- **코호트 관리**: 코호트 생성, 수정, 삭제
- **사용자 관리**: 사용자 목록 조회 및 관리
- **매칭 결과**: 매칭 히스토리 및 결과 분석

## 🔧 기술 스택

| 구분 | 기술 스택 |
|------|----------|
| Frontend | Next.js, TypeScript, React |
| Backend | Node.js, Express.js |
| AI Service | Python, FastAPI, scikit-learn |
| Database | PostgreSQL |
| Container | Docker, Docker Compose |

## 📊 Big Five 성격 검사

### 측정 요소
- **O (Openness)**: 개방성 - 새로운 경험에 대한 개방성
- **C (Conscientiousness)**: 성실성 - 목표 지향적이고 조직적인 성향
- **E (Extraversion)**: 외향성 - 사회적 상호작용과 에너지
- **A (Agreeableness)**: 친화성 - 협력적이고 신뢰하는 성향
- **N (Neuroticism)**: 신경성 - 정서적 안정성과 스트레스 반응

### 역문항 처리
- O: 4, 6번 문항
- C: 10, 12번 문항
- E: 16, 18번 문항
- A: 22, 24번 문항
- N: 28, 30번 문항

### 점수 계산
- 각 요소별 6문항 평균 계산
- 0~1 범위로 정규화
- AI 모델을 통한 매칭 점수 산출

## 🎯 매칭 알고리즘

### 매칭 기준
1. **성격 유사성**: Big Five 점수 기반 유사도 계산
2. **시간표 호환성**: 공통 가능 시간대 분석
3. **역할 다양성**: 팀 내 역할 균형 고려
4. **선호도 반영**: 사용자 선호 사항 고려

### 최적화 방식
- **기본 매칭**: 그리디 알고리즘 기반 매칭 (즉시 사용 가능)
- **딥러닝 매칭**: TensorFlow 기반 딥러닝 모델 (학습 데이터 필요)
  - 모델 학습: POST `/match/train` 엔드포인트 사용
  - 학습 완료 후 `/match/run_deep`으로 고급 매칭 가능
- 다중 목적 최적화를 통한 균형잡힌 팀 구성

## 📁 프로젝트 구조

### 🗂️ BETA_TEST 폴더 구성
```
BETA_TEST/                   # 📁 메인 프로젝트 폴더 (이 폴더 전체를 공유)
├── README.md                # 📄 프로젝트 메인 문서 (이 파일)
├── docker-compose.yml       # 🐳 PostgreSQL 데이터베이스 설정
├── api-fastapi/            # 🤖 AI 서비스 (포트: 8001)
│   ├── app/
│   │   ├── main.py         # FastAPI 메인 애플리케이션
│   │   ├── data_processor.py # 데이터 전처리
│   │   ├── deep_matching.py  # 딥러닝 매칭 모델
│   │   ├── model_evaluation.py # 모델 평가
│   │   └── models/         # 학습된 모델 저장 폴더
│   └── requirements.txt    # Python 의존성
├── server-express/         # 🖥️ 백엔드 API (포트: 8080)
│   ├── src/
│   │   └── index.js        # Express 서버
│   ├── .env.example        # 환경변수 템플릿
│   ├── schema.sql          # 데이터베이스 스키마
│   └── package.json        # Node.js 의존성
└── web-nextjs/             # 🌐 프론트엔드 (포트: 3000)
    ├── pages/
    │   └── index.tsx        # 메인 페이지
    ├── package.json         # React 의존성
    └── .next/              # 빌드 파일 (자동 생성)
```



## 📚 서비스별 상세 문서

### 🤖 [AI 서비스 (FastAPI)](./api-fastapi/README.md)
- **Big Five 성격 분석**: 과학적 검증된 OCEAN 모델 구현
- **딥러닝 매칭 알고리즘**: TensorFlow 기반 고급 팀 매칭
- **모델 학습 및 평가**: 매칭 성능 최적화 도구
- **API 엔드포인트**: `/match/run`, `/match/train`, `/analyze/personality`

### 🖥️ [백엔드 API (Express.js)](./server-express/README.md)
- **데이터 관리**: 사용자, 코호트, 매칭 결과 CRUD
- **매칭 오케스트레이션**: AI 서비스와 연동하여 매칭 실행
- **관리자 인터페이스**: 웹 기반 시스템 관리 도구
- **API 게이트웨이**: 프론트엔드와 AI 서비스 간 중계

### 🌐 [프론트엔드 (Next.js)](./web-nextjs/README.md)
- **Big Five 설문 인터페이스**: 30문항 성격 검사 UI
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **사용자 경험**: 직관적인 플로우와 실시간 피드백
- **데이터 시각화**: OCEAN 점수 및 진행률 표시

## 🚀 설치 및 실행

### 프로젝트 클론
```bash
git clone <repository-url>
cd nexeed-capstone-matching
```

### Docker Compose로 실행
```bash
docker compose up -d
```

### 📋 사용자 가이드

#### 사용자용
1. **설문 참여**: http://localhost:3000 접속
2. **Big Five 검사**: 30문항 성격 검사 완료
3. **결과 확인**: 매칭 완료 후 팀 구성 결과 확인

#### 관리자용
1. **코호트 생성**: 관리자 인터페이스에서 코호트 관리
2. **매칭 실행**: 관리자 인터페이스에서 매칭 실행

## 🤝 기여하기

1. 이슈 등록 또는 기능 제안
2. 브랜치 생성 및 개발
3. 테스트 실행 및 검증
4. Pull Request 제출

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.
