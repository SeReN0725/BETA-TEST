
# NeXeed Backend API

> Express.js 기반 백엔드 API 서버 - 데이터 관리, 매칭 실행, 시스템 통합

## 🎯 핵심 기능

### 데이터 관리
- **PostgreSQL 연동**: 사용자, 코호트, 팀 데이터 관리
- **자동 스키마 관리**: 서버 시작 시 테이블 자동 생성
- **데이터 무결성**: 외래키 제약조건 및 검증
- **중복 데이터 정리**: 관리자 도구 제공

### API 게이트웨이
- **AI 서비스 연동**: FastAPI와의 seamless 통신
- **프론트엔드 지원**: CORS 설정 및 RESTful API
- **실시간 상태 관리**: 매칭 진행 상황 추적
- **오류 처리**: 포괄적인 에러 핸들링

### 매칭 오케스트레이션
- **매칭 전략 선택**: balanced, personality_focused, skill_focused
- **결과 저장 및 조회**: 매칭 히스토리 관리
- **성능 모니터링**: 매칭 성공률 및 처리 시간 추적

## 🚀 빠른 시작

### 환경 설정
```bash
# 환경 변수 파일 복사
cp .env.example .env

# 환경 변수 편집 (필요시)
# POSTGRES_URL=postgresql://user:password@localhost:5432/nexeed
# AI_BASE=http://localhost:8001
```

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
node src/index.js

# 개발 모드 (자동 재시작)
npm install -g nodemon
nodemon src/index.js
```

## 📋 API 엔드포인트

### 코호트 관리

#### `GET /api/cohorts`
모든 코호트 목록 조회
```json
[
  {
    "id": 1,
    "name": "2024 Spring Capstone",
    "description": "2024년 봄학기 캡스톤 프로젝트",
    "created_at": "2024-01-15T09:00:00Z"
  }
]
```

#### `GET /api/cohorts/:cohortId`
특정 코호트 상세 정보 조회

#### `GET /api/cohorts/:cohortId/status`
코호트 현재 상태 및 통계
```json
{
  "cohort_id": 1,
  "total_users": 24,
  "submitted_users": 20,
  "matched_users": 16,
  "teams_formed": 4
}
```

### 사용자 데이터 제출

#### `POST /api/cohorts/:cohortId/submit`
설문 데이터 제출 및 Big Five 분석

```json
// 요청
{
  "name": "홍길동",
  "email": "hong@example.com",
  "student_id": "2020123456",
  "major": "컴퓨터공학과",
  "year": 4,
  "phone": "010-1234-5678",
  "big_five_answers": [4, 3, 5, 2, 4, ...], // 30개 문항 답변 (1-5)
  "availability": {
    "monday": ["09:00-12:00", "14:00-17:00"],
    "tuesday": ["10:00-15:00"]
  },
  "preferred_roles": ["개발자", "기획자"],
  "skills": ["JavaScript", "Python", "React"]
}

// 응답
{
  "success": true,
  "user_id": 123,
  "big_five_scores": {
    "openness": 0.75,
    "conscientiousness": 0.82,
    "extraversion": 0.65,
    "agreeableness": 0.78,
    "neuroticism": 0.45
  }
}
```

### 팀 매칭 관리

#### `POST /api/cohorts/:cohortId/match`
팀 매칭 실행

```json
// 요청
{
  "team_size": 4,
  "matching_strategy": "balanced" // "balanced", "personality_focused", "skill_focused"
}

// 응답
{
  "success": true,
  "teams_created": 5,
  "matched_users": 20,
  "unmatched_users": 0,
  "matching_score": 0.87
}
```

#### `GET /api/cohorts/:cohortId/matches`
매칭 결과 조회

```json
{
  "teams": [
    {
      "team_id": 1,
      "members": [
        {
          "user_id": 123,
          "name": "홍길동",
          "role": "BE",
          "email": "hong@example.com"
        }
      ],
      "matching_score": 0.87,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 사용자 관리

#### `GET /api/users?cohort_id=1`
코호트별 사용자 목록 조회

#### `GET /api/users/:userId`
특정 사용자 상세 정보 조회

### 관리자 기능

#### `POST /api/admin/cleanup-cohorts`
중복 코호트 정리
```json
{
  "success": true,
  "duplicates_removed": 27,
  "remaining_cohorts": 4
}
```

### 데이터베이스 조회 (개발/디버깅용)

```http
GET /api/db/cohorts     # 코호트 테이블 조회
GET /api/db/users       # 사용자 테이블 조회
GET /api/db/matches     # 매칭 테이블 조회
GET /api/db/teams       # 팀 테이블 조회
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### cohorts
```sql
CREATE TABLE cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    cohort_id INTEGER REFERENCES cohorts(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(50),
    major VARCHAR(255),
    year INTEGER,
    phone VARCHAR(20),
    big_five_o DECIMAL(3,2),
    big_five_c DECIMAL(3,2),
    big_five_e DECIMAL(3,2),
    big_five_a DECIMAL(3,2),
    big_five_n DECIMAL(3,2),
    availability JSONB,
    preferred_roles TEXT[],
    skills TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### teams
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    cohort_id INTEGER REFERENCES cohorts(id),
    name VARCHAR(255),
    matching_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### team_members
```sql
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 기술 스택

### 핵심 프레임워크
- **Express.js 4.18+**: 웹 애플리케이션 프레임워크
- **Node.js 16+**: JavaScript 런타임

### 데이터베이스
- **PostgreSQL 13+**: 관계형 데이터베이스
- **pg 8.8+**: PostgreSQL 클라이언트

### 미들웨어 & 유틸리티
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: 환경 변수 관리
- **axios**: HTTP 클라이언트 (AI 서비스 통신)

## 🔄 시스템 통합

### AI 서비스 연동
```javascript
// Big Five 점수 계산 요청
const aiResponse = await axios.post(`${AI_BASE}/score/bigfive`, {
  answers: bigFiveAnswers,
  scale: 5
});

// 팀 매칭 요청
const matchingResponse = await axios.post(`${AI_BASE}/match/run`, {
  team_size: teamSize,
  students: studentsData
});
```

### 데이터 플로우
1. **프론트엔드** → 사용자 데이터 제출
2. **백엔드** → AI 서비스로 Big Five 분석 요청
3. **백엔드** → 분석 결과와 함께 데이터베이스 저장
4. **백엔드** → AI 서비스로 팀 매칭 요청
5. **백엔드** → 매칭 결과 저장 및 프론트엔드 응답

## 🐛 문제 해결

### 일반적인 오류

#### 데이터베이스 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**해결방법:**
1. PostgreSQL 서비스 상태 확인
2. Docker Compose 실행: `docker compose up -d`
3. `.env` 파일의 `POSTGRES_URL` 확인

#### AI 서비스 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:8001
```
**해결방법:**
1. FastAPI 서버 실행 상태 확인
2. AI 서비스 시작: `uvicorn app.main:app --reload --port 8001`
3. `.env` 파일의 `AI_BASE` URL 확인

#### 포트 충돌
```
Error: listen EADDRINUSE :::8080
```
**해결방법:**
1. 포트 사용 프로세스 확인: `netstat -ano | findstr :8080`
2. `.env` 파일에서 다른 포트 설정
3. 프로세스 종료 후 재시작

### 성능 최적화

#### 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_users_cohort_id ON users(cohort_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
```

#### 연결 풀링
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📊 모니터링 및 로깅

### 헬스 체크
```bash
# 서버 상태 확인
curl http://localhost:8080/api/db/cohorts

# 데이터베이스 연결 확인
curl http://localhost:8080/api/cohorts
```

### 로그 모니터링
```javascript
// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 에러 로깅
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

## 🔒 보안 고려사항

### 데이터 보호
- **환경 변수**: 민감한 정보는 `.env` 파일로 관리
- **SQL 인젝션 방지**: 파라미터화된 쿼리 사용
- **입력 검증**: 모든 사용자 입력 데이터 검증
- **CORS 설정**: 허용된 도메인만 접근 가능

### API 보안
```javascript
// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// 입력 검증 예시
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

## 📈 성능 지표

### API 응답 시간
- **사용자 제출**: < 500ms
- **매칭 실행**: < 3초 (100명 기준)
- **데이터 조회**: < 100ms

### 처리량
- **동시 사용자**: 최대 100명
- **일일 매칭**: 최대 1,000회
- **데이터베이스 연결**: 최대 20개 풀

---

> 💡 **팁**: 대용량 데이터 처리 시 배치 처리를 활용하고, 정기적으로 중복 데이터를 정리하세요.

> 🔗 **관련 서비스**: [AI 서비스](../api-fastapi/README.md) | [프론트엔드](../web-nextjs/README.md)
