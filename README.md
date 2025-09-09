
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

## 🔒 보안 주의사항 (GitHub 업로드 전 필수 확인)

⚠️ **중요: GitHub에 업로드하기 전에 반드시 확인하세요!**

### 🛡️ 민감한 정보 보호
1. **환경 변수 파일 확인**
   - `.env` 파일들이 `.gitignore`에 포함되어 있는지 확인
   - 실제 비밀번호나 시크릿이 포함되어 있지 않은지 확인
   
2. **보안 키 생성 필요**
   ```bash
   # 실행 전에 보안 키를 생성하세요
   # INTERNET_DEPLOYMENT_GUIDE.md의 보안 키 생성 스크립트 참조
   ```

3. **기본 설정값 변경**
   - `POSTGRES_PASSWORD`: `your_secure_password_here` → 강력한 비밀번호로 변경
   - `JWT_SECRET`: `your_jwt_secret_here_32_chars_min` → 32자 이상 랜덤 문자열
   - `SESSION_SECRET`: `your_session_secret_here_32_chars_min` → 32자 이상 랜덤 문자열

### ✅ 안전한 GitHub 업로드 체크리스트
- [ ] `.env` 파일들이 `.gitignore`에 포함됨
- [ ] 실제 비밀번호/시크릿이 코드에 하드코딩되지 않음
- [ ] 예시 값들로만 구성되어 있음
- [ ] `INTERNET_DEPLOYMENT_GUIDE.md` 보안 가이드 숙지

---

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
   - 관리자 페이지는 팀 매칭 시스템의 모든 기능을 관리하는 전용 페이지입니다
   - 주요 기능:
     - 코호트(프로젝트 기수) 관리: 생성/수정/삭제
     - 참여자 관리: 학생 정보 조회 및 수정
     - 팀 매칭 실행: AI 기반 자동 매칭 수행
     - 매칭 결과 조회: 생성된 팀 목록 확인
     - 시스템 모니터링: 데이터베이스 상태 확인
3. **접근 방법**:
   - Docker Compose로 서비스 실행 후 웹 브라우저에서 직접 접속
   - 혹은 터미널에서 `curl http://localhost:8080/admin` 명령어로 확인 가능
4. **주의사항**:
   - 관리자 페이지는 내부 관리자 전용으로, 일반 사용자는 접근할 수 없습니다
   - 관리자 권한이 필요한 경우 시스템 관리자에게 문의하세요
3. **매칭 실행**: 
   - **기본 매칭**: POST http://localhost:8001/match/run
   - **딥러닝 매칭**: POST http://localhost:8001/match/run_deep
   - **백엔드 API**: POST http://localhost:8080/api/cohorts/{cohort_id}/match
   ```json
   { "team_size": 4 }
   ```
4. **결과 확인**: 웹 인터페이스 또는 API를 통해 매칭 결과 조회

## 📋 관리자 기능

### 🖥️ 관리자 웹 인터페이스
**접속**: http://localhost:8080/admin

- **대시보드**: 시스템 전체 현황 및 통계
- **코호트 관리**: 코호트 생성, 수정, 삭제
- **사용자 관리**: 사용자 목록 조회 및 관리
- **매칭 결과**: 매칭 히스토리 및 결과 분석
- **데이터베이스**: 실시간 데이터 상태 확인

### 🔧 API 엔드포인트

#### 데이터 관리
- **코호트 관리**: `/api/cohorts` - 코호트 생성, 조회, 수정
- **사용자 관리**: `/api/users` - 사용자 정보 조회 및 관리
- **매칭 관리**: `/api/matches` - 매칭 결과 조회 및 분석

#### 시스템 유지보수
- **중복 데이터 정리**: POST `/api/admin/cleanup-cohorts`
- **데이터베이스 상태**: GET `/api/db/*` - 각 테이블 데이터 조회

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

### 📋 중요 파일 설명
- **README.md**: 전체 프로젝트 사용법 (현재 보고 있는 파일)
- **docker-compose.yml**: 데이터베이스 실행용
- **.env.example**: 환경변수 설정 템플릿
- **requirements.txt**: Python 라이브러리 목록
- **package.json**: Node.js 라이브러리 목록
- **schema.sql**: 데이터베이스 테이블 구조

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

## 🌐 다른 사람과 공유하기

### 📤 BETA_TEST 프로젝트 공유 방법

#### 방법 1: GitHub 저장소로 공유 (추천)
```bash
# 1. GitHub에서 새 저장소 생성
# 2. BETA_TEST 폴더에서 실행
cd BETA_TEST
git init
git add .
git commit -m "NeXeed Capstone Auto-Matching System"
git remote add origin <your-github-repo-url>
git push -u origin main

# 3. 저장소 URL을 다른 사람에게 공유
```

#### 방법 2: 폴더 직접 공유
```bash
# 1. BETA_TEST 폴더 전체를 압축 (ZIP)
# 2. 클라우드 드라이브 (Google Drive, OneDrive 등)에 업로드
# 3. 공유 링크를 다른 사람에게 전달
# 4. 받는 사람은 압축 해제 후 사용
```

#### 방법 3: USB/외장하드로 공유
```bash
# BETA_TEST 폴더 전체를 USB나 외장하드에 복사
# 다른 컴퓨터에서 복사해서 사용
```

#### 🎯 다른 사람이 받은 후 실행 방법
```bash
# 1. 프로젝트 폴더로 이동
cd BETA_TEST

# 2. 아래 Quick Start 가이드 순서대로 실행
# - 사전 요구사항 설치 확인
# - 데이터베이스 실행
# - 각 서비스 실행
```

### 🚀 서버 배포 (선택사항)

#### Docker를 이용한 배포
```bash
# 각 서비스별 Dockerfile 생성 후
docker-compose up -d --build
```

#### 클라우드 배포 옵션
- **Vercel**: 프론트엔드 (Next.js) 배포
- **Railway/Render**: 백엔드 API 배포
- **Google Colab**: AI 서비스 배포
- **Supabase/PlanetScale**: 데이터베이스 호스팅

### 📋 사용자 가이드

#### 관리자용
1. **시스템 설정**: 환경변수 및 데이터베이스 설정
2. **코호트 생성**: http://localhost:8080/admin에서 코호트 관리
3. **사용자 초대**: 설문 링크 공유 (http://localhost:3000)
4. **매칭 실행**: 관리자 인터페이스에서 매칭 실행

#### 사용자용
1. **설문 참여**: 제공받은 링크로 접속
2. **Big Five 검사**: 30문항 성격 검사 완료
3. **결과 확인**: 매칭 완료 후 팀 구성 결과 확인

## 🤝 기여하기

1. 이슈 등록 또는 기능 제안
2. 브랜치 생성 및 개발
3. 테스트 실행 및 검증
4. Pull Request 제출

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.
