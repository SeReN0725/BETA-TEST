# 🌐 인터넷 배포 완전 가이드

> 초보자도 쉽게 따라할 수 있는 단계별 배포 가이드입니다.

## 📋 목차

1. [배포 준비 상태 확인](#배포-준비-상태-확인)
2. [배포 전 준비사항](#배포-전-준비사항)
3. [서비스별 배포 전략](#서비스별-배포-전략)
4. [1단계: 프론트엔드 배포 (Vercel)](#1단계-프론트엔드-배포-vercel)
5. [2단계: 백엔드 배포 (Railway)](#2단계-백엔드-배포-railway)
6. [3단계: AI 서비스 배포](#3단계-ai-서비스-배포)
7. [4단계: 환경 변수 연결](#4단계-환경-변수-연결)
8. [5단계: 도메인 연결 및 테스트](#5단계-도메인-연결-및-테스트)
9. [문제 해결 가이드](#문제-해결-가이드)
10. [비용 및 확장 계획](#비용-및-확장-계획)

---

## ✅ 배포 준비 상태 확인

### 현재 프로젝트 상태

**✅ 배포 준비 완료!** 다음 사항들이 모두 준비되어 있습니다:

#### 보안 설정
- ✅ JWT_SECRET: 환경변수로 설정됨
- ✅ SESSION_SECRET: 환경변수로 설정됨 
- ✅ 데이터베이스 연결: 환경변수로 설정됨
- ✅ .env 파일: .gitignore에 포함됨
- ✅ 하드코딩된 비밀번호: 제거됨

#### 서비스 구성
- ✅ 프론트엔드 (Next.js): 포트 3000
- ✅ 백엔드 (Express.js): 포트 8080
- ✅ AI 서비스 (FastAPI): 포트 8001
- ✅ 데이터베이스 (PostgreSQL): 포트 5432

#### Docker 설정
- ✅ 모든 서비스에 Dockerfile 존재
- ✅ docker-compose.yml 설정 완료
- ✅ 환경변수 연결 설정됨

#### 환경변수 설정
- ✅ 프론트엔드: NEXT_PUBLIC_API_URL 사용
- ✅ 백엔드: 모든 민감 정보 환경변수화
- ✅ AI 서비스: 별도 환경변수 불필요

### 배포 전 최종 체크리스트

```bash
# 1. 모든 서비스가 로컬에서 정상 작동하는지 확인
docker-compose up

# 2. 환경변수 파일 확인
ls -la .env*

# 3. .gitignore 확인 (민감한 파일들이 제외되는지)
cat .gitignore

# 4. 빌드 테스트
cd web-nextjs && npm run build
cd ../server-express && npm install
cd ../api-fastapi && pip install -r requirements.txt
```

---

## 🚀 배포 전 준비사항

### 필요한 계정 생성

1. **GitHub 계정** (필수)
   - [github.com](https://github.com)에서 회원가입
   - 프로젝트를 GitHub에 업로드해야 합니다

2. **Vercel 계정** (프론트엔드용)
   - [vercel.com](https://vercel.com)에서 GitHub 계정으로 로그인
   - 무료 플랜 사용 가능

3. **Railway 계정** (백엔드용)
   - [railway.app](https://railway.app)에서 GitHub 계정으로 로그인
   - 무료 $5 크레딧 제공

### 프로젝트 GitHub 업로드

```bash
# 1. GitHub에서 새 저장소 생성 (예: nexeed-beta-test)

# 2. 로컬 프로젝트를 GitHub에 업로드
cd c:\Users\sjw03\BETA_TEST
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/nexeed-beta-test.git
git push -u origin main
```

---

## 🎯 서비스별 배포 전략

### 배포 구조

```
인터넷 배포 구조:

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   프론트엔드      │    │     백엔드       │    │   AI 서비스      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (Railway)     │
│   Next.js       │    │   Express.js    │    │   FastAPI       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   데이터베이스    │
                       │   (Railway)     │
                       │   PostgreSQL    │
                       └─────────────────┘
```

### 배포 순서

1. **백엔드 + 데이터베이스** 먼저 배포
2. **AI 서비스** 배포
3. **프론트엔드** 마지막 배포 (백엔드 URL 필요)

---

## 🖥️ 1단계: 프론트엔드 배포 (Vercel)

### 1.1 Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. "Import" 클릭

### 1.2 프로젝트 설정

```yaml
# Vercel 설정
Framework Preset: Next.js
Root Directory: web-nextjs
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 1.3 환경 변수 설정

**Vercel 대시보드에서:**

1. 프로젝트 → Settings → Environment Variables
2. 다음 변수들 추가:

```env
# 백엔드 API URL (Railway 배포 후 실제 URL로 업데이트)
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

> ⚠️ **주의**: 백엔드 배포 후 실제 URL로 업데이트해야 합니다!
> 현재 코드에서는 `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'` 형태로 사용됩니다.

### 1.4 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 완료까지 대기 (약 2-3분)
3. 배포 완료 후 URL 확인 (예: `https://nexeed-beta-test.vercel.app`)

---

## 🔧 2단계: 백엔드 배포 (Railway)

### 2.1 Railway 프로젝트 생성

1. [railway.app](https://railway.app)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택

### 2.2 서비스 설정

#### PostgreSQL 데이터베이스 추가

1. 프로젝트 대시보드에서 "+ New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 데이터베이스 생성 완료

#### Express.js 서비스 설정

1. "+ New" → "GitHub Repo" 클릭
2. 저장소 선택
3. Root Directory: `server-express`
4. Start Command: `npm start`

### 2.3 환경 변수 설정

**Railway 대시보드에서:**

1. Express 서비스 선택
2. "Variables" 탭 클릭
3. 다음 변수들 추가:

```env
# 서버 포트
PORT=8080

# 데이터베이스 연결 (Railway PostgreSQL 연결 URL)
POSTGRES_URL=${{Postgres.DATABASE_URL}}

# JWT 시크릿 (강력한 랜덤 문자열로 변경 필요)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 세션 시크릿 (강력한 랜덤 문자열로 변경 필요)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# 프론트엔드 URL (Vercel 배포 후 실제 URL로 업데이트)
FRONTEND_URL=https://your-frontend-url.vercel.app

# AI 서비스 기본 URL (AI 서비스 배포 후 업데이트)
AI_BASE=https://your-ai-service.railway.app
```

> 🔒 **보안 주의사항**: 
> - JWT_SECRET과 SESSION_SECRET은 반드시 강력한 랜덤 문자열로 변경하세요
> - 온라인 랜덤 생성기를 사용하거나 `openssl rand -base64 32` 명령어를 사용하세요

### 2.4 데이터베이스 스키마 설정

1. Railway PostgreSQL 서비스 선택
2. "Connect" 탭에서 연결 정보 확인
3. 로컬에서 스키마 실행:

```bash
# Railway 데이터베이스에 스키마 적용
psql "postgresql://username:password@host:port/database" -f server-express/schema.sql
```

### 2.5 배포 확인

1. 배포 완료 후 URL 확인 (예: `https://nexeed-backend.railway.app`)
2. API 엔드포인트 테스트:
   ```bash
   curl https://nexeed-backend.railway.app/api/health
   ```

---

## 🤖 3단계: AI 서비스 배포

### 3.1 AI 서비스 생성

1. Railway 프로젝트에서 "+ New" 클릭
2. "GitHub Repo" 선택
3. 다음 설정 적용:
   - **Root Directory**: `api-fastapi`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Build Command**: `pip install -r requirements.txt`

### 3.2 환경 변수 설정

**Railway AI 서비스에서:**

```env
# 포트 설정 (Railway에서 자동 할당)
PORT=8001
```

> 📝 **참고**: 
> - AI 서비스는 별도의 환경변수가 필요하지 않습니다
> - TensorFlow 및 ML 라이브러리는 requirements.txt에서 자동 설치됩니다
> - 현재 requirements.txt 포함 라이브러리:
>   - fastapi==0.112.0
>   - uvicorn==0.30.3
>   - tensorflow>=2.13.0,<2.16.0
>   - numpy, pandas, scikit-learn, matplotlib

### 3.3 배포 확인

1. 배포 완료 후 URL 확인 (예: `https://nexeed-ai.railway.app`)
2. API 문서 확인: `https://nexeed-ai.railway.app/docs`
3. 헬스 체크: `https://nexeed-ai.railway.app/health`

> ⚠️ **주의**: AI 서비스는 TensorFlow 때문에 빌드 시간이 5-10분 소요될 수 있습니다.

---

## 🔗 4단계: 환경 변수 연결

### 4.1 백엔드 환경 변수 업데이트

**Railway 백엔드 서비스에서:**

```env
# AI 서비스 URL 업데이트 (AI 서비스 배포 완료 후)
AI_BASE=https://your-ai-service.railway.app
```

### 4.2 프론트엔드 환경 변수 업데이트

**Vercel 프로젝트에서:**

```env
# 백엔드 URL 업데이트 (백엔드 배포 완료 후)
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

### 4.3 재배포 및 확인

1. **Railway 백엔드**: 환경 변수 변경 후 자동 재배포
2. **Vercel 프론트엔드**: 환경 변수 변경 후 자동 재배포
3. **배포 순서 확인**:
   - ✅ 데이터베이스 (PostgreSQL)
   - ✅ 백엔드 (Express.js)
   - ✅ AI 서비스 (FastAPI)
   - ✅ 프론트엔드 (Next.js)

> 💡 **팁**: 각 서비스 배포 완료 후 다음 서비스의 환경변수를 업데이트하세요

---

## 🌐 5단계: 도메인 연결 및 테스트

### 5.1 커스텀 도메인 설정 (선택사항)

#### Vercel 도메인 설정

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `nexeed.yourdomain.com`)
3. DNS 설정 안내에 따라 도메인 연결

#### Railway 도메인 설정

1. Railway 서비스 → Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정 완료

### 5.2 전체 시스템 테스트

#### 5.2.1 프론트엔드 테스트

1. 프론트엔드 URL 접속
2. 페이지 로딩 확인
3. 관리자 페이지 접속: `/admin`

#### 5.2.2 백엔드 API 테스트

```bash
# 헬스 체크 (현재 구현된 엔드포인트)
curl https://your-backend-service.railway.app/api/cohorts

# 로그인 테스트
curl -X POST https://your-backend-service.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 코호트 목록 조회
curl https://your-backend-service.railway.app/api/cohorts
```

> 📝 **참고**: 현재 구현된 API 엔드포인트:
> - `GET /api/cohorts` - 코호트 목록
> - `POST /api/login` - 관리자 로그인
> - `POST /api/cohorts/:id/submit` - 설문 제출
> - `POST /api/cohorts/:id/match` - AI 매칭 실행

#### 5.2.3 AI 서비스 테스트

```bash
# AI 서비스 상태 확인
curl https://your-ai-service.railway.app/

# 매칭 API 테스트
curl -X POST https://your-ai-service.railway.app/match \
  -H "Content-Type: application/json" \
  -d '{"responses": [[1,2,3,4,5]], "cohort_id": 1}'

# API 문서 확인
# 브라우저에서 https://your-ai-service.railway.app/docs 접속
```

> 📝 **참고**: AI 서비스 엔드포인트:
> - `GET /` - 서비스 상태 확인
> - `POST /match` - Big Five 매칭 실행
> - `GET /docs` - FastAPI 자동 문서

### 5.3 통합 테스트 시나리오

#### 시나리오 1: 관리자 워크플로우

1. **관리자 로그인**
   - 프론트엔드에서 `/admin/login` 접속
   - `admin` / `admin123`로 로그인
   - 관리자 대시보드(`/admin`) 접근 확인

2. **코호트 관리**
   - 코호트 목록 조회
   - 기존 코호트 상태 확인

#### 시나리오 2: 학생 설문 워크플로우

1. **설문 참여**
   - 메인 페이지(`/`) 접속
   - 30개 Big Five 문항 응답
   - 설문 제출 확인

2. **AI 매칭 실행**
   - 관리자 페이지에서 매칭 실행
   - AI 서비스 연동 확인
   - 매칭 결과 생성 확인

#### 시나리오 3: 전체 시스템 연동 테스트

1. **서비스 간 통신 확인**
   - 프론트엔드 → 백엔드 API 호출
   - 백엔드 → AI 서비스 호출
   - 백엔드 → 데이터베이스 연결

2. **데이터 플로우 확인**
   - 설문 데이터 저장
   - AI 분석 결과 저장
   - 매칭 결과 조회

---

## 🔒 보안 체크리스트

### 배포 전 보안 점검

#### ✅ 환경변수 보안
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 모든 민감한 정보가 환경변수로 설정되어 있는지 확인
- [ ] 하드코딩된 비밀번호/시크릿이 없는지 확인
- [ ] JWT_SECRET과 SESSION_SECRET이 강력한 랜덤 문자열인지 확인

#### ✅ 데이터베이스 보안
- [ ] 기본 관리자 비밀번호가 변경되었는지 확인
- [ ] 데이터베이스 연결이 SSL로 암호화되어 있는지 확인
- [ ] 불필요한 데이터베이스 권한이 없는지 확인

#### ✅ API 보안
- [ ] CORS 설정이 적절한지 확인 (특정 도메인만 허용)
- [ ] 세션 관리가 안전하게 구현되어 있는지 확인
- [ ] API 엔드포인트에 적절한 인증이 적용되어 있는지 확인

#### ✅ 프론트엔드 보안
- [ ] 민감한 정보가 클라이언트 코드에 노출되지 않는지 확인
- [ ] HTTPS 연결이 강제되는지 확인
- [ ] XSS 방지 조치가 적용되어 있는지 확인

### 🔐 보안 키 자동 생성 가이드 (초보자용)

#### Windows 사용자 (PowerShell)

**1단계: PowerShell 열기**
- `Windows + R` → `powershell` 입력 → Enter

**2단계: 보안 키 생성 스크립트 실행**
```powershell
# JWT Secret 생성
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Green

# Session Secret 생성
$sessionSecret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
Write-Host "SESSION_SECRET=$sessionSecret" -ForegroundColor Green

# 관리자 비밀번호 생성
$adminPassword = [System.Web.Security.Membership]::GeneratePassword(16, 4)
Write-Host "ADMIN_PASSWORD=$adminPassword" -ForegroundColor Yellow

Write-Host "\n⚠️  위 값들을 안전한 곳에 복사해두세요!" -ForegroundColor Red
```

#### Mac/Linux 사용자
```bash
# JWT Secret 생성
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Session Secret 생성
echo "SESSION_SECRET=$(openssl rand -base64 32)"

# 관리자 비밀번호 생성
echo "ADMIN_PASSWORD=$(openssl rand -base64 12)"
```

#### 🚨 중요: 생성된 키 사용법

**Railway 백엔드 환경변수에 설정:**
1. Railway 대시보드 → Express 서비스 → Variables
2. 위에서 생성된 값들을 복사하여 설정:
   ```
   JWT_SECRET=생성된_JWT_값
   SESSION_SECRET=생성된_SESSION_값
   ```

**관리자 계정 변경:**
1. `server-express/src/index.js` 파일 수정
2. 기본 관리자 정보 변경:
   ```javascript
   // 기존 코드 찾기
   const defaultAdmin = {
     username: 'admin',
     password: 'admin123'  // ← 이 부분을 변경
   };
   
   // 새로운 안전한 비밀번호로 변경
   const defaultAdmin = {
     username: 'admin',
     password: '생성된_ADMIN_PASSWORD_값'
   };
   ```

#### ✅ 보안 설정 완료 체크리스트
- [ ] JWT_SECRET: 32자 이상 랜덤 문자열로 설정
- [ ] SESSION_SECRET: 32자 이상 랜덤 문자열로 설정
- [ ] 관리자 비밀번호: 기본값에서 변경
- [ ] 모든 키를 안전한 곳에 백업
- [ ] GitHub에 키가 업로드되지 않았는지 확인

#### 📊 정기 보안 점검 (초보자 가이드)

**매주 확인사항:**
- [ ] Railway 사용량 모니터링 (무료 한도 확인)
- [ ] 서비스 정상 작동 확인
- [ ] 에러 로그 확인

**매월 확인사항:**
- [ ] 의존성 취약점 스캔
  ```bash
  # 프론트엔드 취약점 검사
  cd web-nextjs
  npm audit
  npm audit fix
  
  # 백엔드 취약점 검사
  cd ../server-express
  npm audit
  npm audit fix
  
  # AI 서비스 취약점 검사
  cd ../api-fastapi
  pip-audit
  ```

**3개월마다 확인사항:**
- [ ] 환경변수 로테이션 (새로운 키 생성 및 교체)
- [ ] 백업 데이터 복구 테스트
- [ ] 접근 로그 분석

**🔧 자동화 도구 설정 (선택사항):**
- GitHub Dependabot 활성화 (자동 보안 업데이트)
- Railway 알림 설정 (사용량 초과 시 알림)
- Vercel 모니터링 설정

---

## 🆘 문제 해결 가이드 (초보자용)

### 💰 비용 관리 및 모니터링

#### Railway 무료 한도 모니터링

**1단계: 사용량 확인 방법**
1. [railway.app](https://railway.app) 로그인
2. 프로젝트 선택
3. 우측 상단 "Usage" 클릭
4. 월별 크레딧 사용량 확인

**2단계: 알림 설정**
1. 프로젝트 Settings → Notifications
2. "Usage alerts" 활성화
3. 80% 사용 시 알림 설정

**3단계: 비용 절약 팁**
```yaml
# Railway 서비스 최적화
- AI 서비스: 사용하지 않을 때 일시 정지
- 데이터베이스: 불필요한 연결 정리
- 로그: 과도한 로깅 비활성화
```

#### 🚨 무료 한도 초과 시 대응방법

**즉시 조치:**
1. Railway 대시보드에서 서비스 일시 정지
2. 사용량 분석 및 최적화
3. 필요시 유료 플랜 업그레이드 ($20/월)

**예방 조치:**
- 베타테스트 참여자 수 제한 (초기 10-20명)
- 일일 사용량 모니터링
- 백업 배포 계획 준비

### 🤖 AI 서비스 메모리 이슈 해결

#### 문제: TensorFlow 메모리 부족

**증상:**
- AI 서비스 크래시
- 매칭 요청 실패
- Railway 메모리 한도 초과

**해결방법 1: 메모리 최적화**
```python
# api-fastapi/app/main.py 수정
import tensorflow as tf

# GPU 메모리 제한 설정
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    tf.config.experimental.set_memory_growth(gpus[0], True)

# CPU 메모리 최적화
tf.config.threading.set_inter_op_parallelism_threads(1)
tf.config.threading.set_intra_op_parallelism_threads(1)
```

**해결방법 2: 대안 AI 서비스**
```python
# 경량화된 매칭 알고리즘 사용
# requirements.txt에서 tensorflow 제거하고
# scikit-learn만 사용하는 버전으로 변경
```

**해결방법 3: 외부 AI 서비스 사용**
- Hugging Face Inference API
- Google Colab (무료)
- OpenAI API (유료)

### 자주 발생하는 문제들

#### 1. 🌐 CORS 오류 (가장 흔한 문제)

**증상:**
- 브라우저 콘솔에 "CORS policy" 오류 메시지
- 프론트엔드에서 백엔드 API 호출 실패
- 네트워크 탭에서 OPTIONS 요청 실패

**단계별 해결방법:**

**1단계: 오류 확인**
```
브라우저 F12 → Console 탭에서 다음과 같은 오류 확인:
"Access to fetch at 'https://your-backend.railway.app/api/login' 
from origin 'https://your-frontend.vercel.app' has been blocked by CORS policy"
```

**2단계: 백엔드 CORS 설정 수정**
```javascript
// server-express/src/index.js 파일 수정
app.use(cors({
  origin: [
    'https://your-actual-frontend-url.vercel.app',  // ← 실제 Vercel URL로 변경
    'https://your-custom-domain.com',               // ← 커스텀 도메인 (있는 경우)
    'http://localhost:3000'                         // ← 로컬 개발용 (배포 시 제거 가능)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**3단계: Railway에서 재배포**
- Railway 대시보드에서 코드 변경 후 자동 재배포 확인
- 또는 수동으로 "Deploy" 버튼 클릭

**4단계: 테스트**
```bash
# 브라우저 콘솔에서 테스트
fetch('https://your-backend.railway.app/api/cohorts')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### 2. 🔑 환경 변수 오류

**증상:**
- "Cannot connect to database" 오류
- "JWT secret not defined" 오류
- API 연결 실패 (404, 500 오류)

**단계별 해결방법:**

**1단계: 환경 변수 확인**
```bash
# Railway 대시보드에서 확인해야 할 변수들:
PORT=8080
POSTGRES_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-generated-jwt-secret
SESSION_SECRET=your-generated-session-secret
FRONTEND_URL=https://your-frontend.vercel.app
AI_BASE=https://your-ai-service.railway.app
```

**2단계: 변수명 오타 확인**
```javascript
// server-express/src/index.js에서 사용되는 변수명 확인
process.env.POSTGRES_URL     // ← 정확한 변수명
process.env.JWT_SECRET       // ← 정확한 변수명
process.env.SESSION_SECRET   // ← 정확한 변수명
```

**3단계: URL 형식 확인**
```
올바른 형식:
✅ https://your-service.railway.app
✅ https://your-app.vercel.app

잘못된 형식:
❌ your-service.railway.app (https:// 누락)
❌ https://your-service.railway.app/ (마지막 슬래시)
❌ http://your-service.railway.app (http 대신 https)
```

#### 3. 🗄️ 데이터베이스 연결 오류

**증상:**
- "Connection refused" 오류
- "Database does not exist" 오류
- 백엔드 서비스 크래시

**단계별 해결방법:**

**1단계: PostgreSQL 서비스 상태 확인**
1. Railway 대시보드 → PostgreSQL 서비스 선택
2. "Metrics" 탭에서 서비스 상태 확인
3. "Logs" 탭에서 오류 메시지 확인

**2단계: 데이터베이스 URL 확인**
```bash
# Railway PostgreSQL 서비스에서 "Connect" 탭 확인
# DATABASE_URL 형식:
postgresql://username:password@host:port/database
```

**3단계: 스키마 적용 확인**
```bash
# 로컬에서 Railway 데이터베이스에 스키마 적용
psql "$DATABASE_URL" -f server-express/schema.sql

# 또는 Railway 대시보드에서 직접 실행
# PostgreSQL 서비스 → "Query" 탭에서 schema.sql 내용 복사 후 실행
```

#### 4. 🚀 빌드 및 배포 실패

**증상:**
- Vercel/Railway에서 빌드 실패
- "Module not found" 오류
- "Build timeout" 오류

**단계별 해결방법:**

**프론트엔드 빌드 실패:**
```bash
# 로컬에서 빌드 테스트
cd web-nextjs
npm install
npm run build

# 일반적인 해결방법:
# 1. package-lock.json 삭제 후 재설치
rm package-lock.json
rm -rf node_modules
npm install

# 2. Next.js 버전 호환성 확인
npm update next react react-dom
```

**백엔드 빌드 실패:**
```bash
# 로컬에서 테스트
cd server-express
npm install
npm start

# Railway 설정 확인:
# Start Command: npm start
# Build Command: npm install
```

**AI 서비스 빌드 실패:**
```bash
# 로컬에서 테스트
cd api-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload

# Railway 설정 확인:
# Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
# Build Command: pip install -r requirements.txt
```

#### 5. 🔐 인증 및 세션 오류

**증상:**
- 로그인 후 바로 로그아웃됨
- "Unauthorized" 오류
- 세션이 유지되지 않음

**해결방법:**
```javascript
// server-express/src/index.js 세션 설정 확인
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS에서만 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));
```

#### 6. 📱 모바일/반응형 이슈

**증상:**
- 모바일에서 레이아웃 깨짐
- 터치 이벤트 작동 안 함
- 화면 크기별 표시 문제

**해결방법:**
```css
/* web-nextjs/styles/globals.css 또는 컴포넌트 스타일에 추가 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
    font-size: 14px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  button {
    width: 100%;
    padding: 12px;
  }
}
```

#### 🆘 긴급 상황 대응

**서비스 전체 다운 시:**
1. Railway 대시보드에서 모든 서비스 상태 확인
2. 로그에서 오류 메시지 확인
3. 환경 변수 재확인
4. 필요시 서비스 재시작
5. 백업 계획 실행

**데이터 손실 위험 시:**
1. 즉시 데이터베이스 백업 실행
2. Railway PostgreSQL 서비스 일시 정지
3. 백업 데이터로 복구
4. 원인 분석 후 재배포

#### 3. 빌드 실패

**증상**: 배포 중 빌드 오류

**해결방법**:
```bash
# 로컬에서 빌드 테스트
cd web-nextjs
npm run build

cd ../server-express
npm install
npm start

cd ../api-fastapi
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 4. 데이터베이스 연결 오류

**증상**: 백엔드에서 데이터베이스 접근 실패

**해결방법**:
1. Railway PostgreSQL 서비스 상태 확인
2. `DATABASE_URL` 환경 변수 확인
3. 스키마 적용 여부 확인

### 로그 확인 방법

#### Vercel 로그
1. Vercel 대시보드 → Functions 탭
2. 실시간 로그 확인

#### Railway 로그
1. Railway 서비스 선택
2. "Deployments" 탭에서 로그 확인

---

## 💰 비용 및 확장 계획

### 무료 플랜 제한사항

#### Vercel 무료 플랜
- **대역폭**: 100GB/월
- **빌드 시간**: 6,000분/월
- **함수 실행**: 100GB-시간/월
- **도메인**: 무제한

#### Railway 무료 플랜
- **크레딧**: $5/월
- **실행 시간**: 약 500시간/월
- **메모리**: 512MB
- **스토리지**: 1GB

### 확장 계획

#### 트래픽 증가 시

**1단계: Pro 플랜 업그레이드**
- Vercel Pro: $20/월
- Railway Pro: $20/월
- **총 비용**: $40/월

**2단계: 성능 최적화**
- CDN 활용
- 데이터베이스 최적화
- 캐싱 구현

**3단계: 인프라 확장**
- 로드 밸런서 추가
- 데이터베이스 복제
- 모니터링 시스템 구축

### 비용 모니터링

#### Railway 사용량 확인
1. Railway 대시보드 → Usage
2. 월별 크레딧 사용량 확인
3. 알림 설정

#### Vercel 사용량 확인
1. Vercel 대시보드 → Usage
2. 대역폭 및 함수 실행 시간 확인

---

## 🎯 배포 완료 체크리스트 (초보자용)

### 📋 0단계: 배포 전 필수 준비사항

#### 계정 생성 및 설정
- [ ] **GitHub 계정 생성** 
  - [github.com](https://github.com) 회원가입
  - 새 저장소 생성 (예: `nexeed-beta-test`)
  - 로컬 프로젝트 업로드 완료
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/your-username/nexeed-beta-test.git
  git push -u origin main
  ```

- [ ] **Vercel 계정 생성**
  - [vercel.com](https://vercel.com)에서 GitHub 계정으로 로그인
  - 대시보드 접근 확인

- [ ] **Railway 계정 생성**
  - [railway.app](https://railway.app)에서 GitHub 계정으로 로그인
  - $5 무료 크레딧 확인

#### 로컬 환경 테스트
- [ ] **Docker Compose 정상 동작 확인**
  ```bash
  cd c:\Users\sjw03\BETA_TEST
  docker-compose up
  # 모든 서비스가 정상 실행되는지 확인:
  # - web-nextjs: http://localhost:3000
  # - server-express: http://localhost:8080
  # - api-fastapi: http://localhost:8001
  # - PostgreSQL: 포트 5432
  ```

- [ ] **보안 키 생성 완료**
  - PowerShell에서 보안 키 생성 스크립트 실행
  - JWT_SECRET, SESSION_SECRET, ADMIN_PASSWORD 생성
  - 안전한 곳에 백업 완료

### 🗄️ 1단계: 데이터베이스 배포 확인

- [ ] **Railway PostgreSQL 데이터베이스 생성**
  - Railway 대시보드 → "New Project" → "Database" → "PostgreSQL"
  - 데이터베이스 생성 완료 확인
  - "Connect" 탭에서 DATABASE_URL 확인

- [ ] **데이터베이스 스키마 적용**
  ```bash
  # Railway 데이터베이스에 스키마 적용
  psql "postgresql://username:password@host:port/database" -f server-express/schema.sql
  
  # 또는 Railway 대시보드에서:
  # PostgreSQL 서비스 → "Query" 탭 → schema.sql 내용 복사 후 실행
  ```

- [ ] **테이블 생성 확인**
  ```sql
  -- Railway Query 탭에서 실행하여 테이블 확인
  \dt
  SELECT * FROM cohorts LIMIT 5;
  SELECT * FROM users LIMIT 5;
  ```

- [ ] **기본 관리자 계정 생성 확인**
  ```sql
  -- 관리자 계정 존재 확인
  SELECT username FROM users WHERE username = 'admin';
  ```

### 🔧 2단계: 백엔드 배포 확인

- [ ] **Railway Express.js 서비스 배포**
  - Railway 프로젝트 → "New" → "GitHub Repo"
  - Root Directory: `server-express`
  - Start Command: `npm start`
  - 배포 완료 후 URL 확인 (예: `https://nexeed-backend.railway.app`)

- [ ] **환경 변수 설정 완료**
  - Railway Express 서비스 → "Variables" 탭
  ```env
  PORT=8080
  POSTGRES_URL=${{Postgres.DATABASE_URL}}
  JWT_SECRET=생성된_JWT_시크릿
  SESSION_SECRET=생성된_SESSION_시크릿
  FRONTEND_URL=https://your-frontend.vercel.app
  AI_BASE=https://your-ai-service.railway.app
  ```

- [ ] **API 엔드포인트 테스트 완료**
  ```bash
  # 1. 코호트 목록 조회
  curl https://your-backend.railway.app/api/cohorts
  # 예상 결과: [{"id":1,"name":"기본 코호트","description":"..."}]
  
  # 2. 관리자 로그인 테스트
  curl -X POST https://your-backend.railway.app/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"변경된_관리자_비밀번호"}'
  # 예상 결과: {"message":"로그인 성공","user":{"username":"admin"}}
  
  # 3. 헬스 체크 (서비스 상태 확인)
  curl https://your-backend.railway.app/
  # 예상 결과: 서버 응답 확인
  ```

- [ ] **로그 확인**
  - Railway Express 서비스 → "Deployments" 탭 → 최신 배포 로그 확인
  - 오류 메시지 없이 정상 실행 확인

### 🤖 3단계: AI 서비스 배포 확인

- [ ] **Railway FastAPI 서비스 배포**
  - Railway 프로젝트 → "New" → "GitHub Repo"
  - Root Directory: `api-fastapi`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Build Command: `pip install -r requirements.txt`
  - 배포 완료 후 URL 확인 (예: `https://nexeed-ai.railway.app`)

- [ ] **TensorFlow 및 ML 라이브러리 설치 확인**
  ```bash
  # Railway AI 서비스 로그에서 확인해야 할 내용:
  # ✅ "Successfully installed tensorflow-2.15.0"
  # ✅ "Successfully installed fastapi-0.112.0"
  # ✅ "Application startup complete"
  # ❌ "ModuleNotFoundError" 또는 "ImportError" 없음
  ```

- [ ] **API 엔드포인트 테스트 완료**
  ```bash
  # 1. 서비스 상태 확인
  curl https://your-ai-service.railway.app/
  # 예상 결과: {"message":"AI 서비스가 정상 작동 중입니다"}
  
  # 2. API 문서 접근 확인
  # 브라우저에서 https://your-ai-service.railway.app/docs 접속
  # FastAPI 자동 문서 페이지 표시 확인
  
  # 3. Big Five 매칭 테스트
  curl -X POST https://your-ai-service.railway.app/match \
    -H "Content-Type: application/json" \
    -d '{"responses":[[3,4,2,5,1,3,4,2,5,1,3,4,2,5,1,3,4,2,5,1,3,4,2,5,1,3,4,2,5,1]],"cohort_id":1}'
  # 예상 결과: 매칭 결과 JSON 응답
  ```

- [ ] **메모리 사용량 확인**
  - Railway AI 서비스 → "Metrics" 탭
  - 메모리 사용량이 512MB 이하인지 확인
  - CPU 사용률 정상 범위 확인

- [ ] **백엔드와 AI 서비스 연결 테스트**
  - 백엔드 환경변수 `AI_BASE`가 AI 서비스 URL로 설정되었는지 확인
  - 백엔드에서 AI 서비스 호출 테스트

### 🖥️ 4단계: 프론트엔드 배포 확인

- [ ] **Vercel Next.js 프로젝트 배포**
  - Vercel 대시보드 → "New Project"
  - GitHub 저장소 선택 → "Import"
  - Framework Preset: Next.js
  - Root Directory: `web-nextjs`
  - 배포 완료 후 URL 확인 (예: `https://nexeed-beta-test.vercel.app`)

- [ ] **환경 변수 설정 완료**
  - Vercel 프로젝트 → Settings → Environment Variables
  ```env
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app
  ```
  - 환경변수 추가 후 자동 재배포 확인

- [ ] **페이지 접근 테스트**
  ```bash
  # 1. 메인 설문 페이지 접근
  # 브라우저에서 https://your-frontend.vercel.app/ 접속
  # ✅ 30개 Big Five 설문 문항 표시 확인
  # ✅ "설문 제출" 버튼 표시 확인
  
  # 2. 관리자 로그인 페이지
  # 브라우저에서 https://your-frontend.vercel.app/admin/login 접속
  # ✅ 로그인 폼 표시 확인
  
  # 3. 관리자 대시보드 (로그인 후)
  # https://your-frontend.vercel.app/admin 접속
  # ✅ 코호트 목록 표시 확인
  # ✅ "AI 매칭 실행" 버튼 표시 확인
  ```

- [ ] **백엔드 API 연결 테스트**
  ```javascript
  // 브라우저 개발자 도구 Console에서 실행
  fetch('/api/cohorts')
    .then(response => response.json())
    .then(data => console.log('API 연결 성공:', data))
    .catch(error => console.error('API 연결 실패:', error));
  ```

- [ ] **빌드 로그 확인**
  - Vercel 프로젝트 → Functions 탭
  - 빌드 오류 없이 성공 확인
  - 실시간 로그에서 오류 메시지 없음 확인

### 🔄 5단계: 통합 테스트 완료

- [ ] **관리자 로그인 플로우 테스트**
  ```
  1. https://your-frontend.vercel.app/admin/login 접속
  2. 사용자명: admin
  3. 비밀번호: 변경된_관리자_비밀번호 입력
  4. "로그인" 버튼 클릭
  5. ✅ 관리자 대시보드로 리다이렉트 확인
  6. ✅ 코호트 목록 표시 확인
  ```

- [ ] **30개 Big Five 설문 제출 테스트**
  ```
  1. https://your-frontend.vercel.app/ 접속
  2. 30개 문항에 모두 응답 (1-5점 척도)
  3. "설문 제출" 버튼 클릭
  4. ✅ "설문이 성공적으로 제출되었습니다" 메시지 확인
  5. ✅ 브라우저 Network 탭에서 POST 요청 성공 확인
  ```

- [ ] **AI 매칭 실행 및 결과 확인**
  ```
  1. 관리자 대시보드에서 "AI 매칭 실행" 버튼 클릭
  2. ✅ "매칭이 시작되었습니다" 메시지 확인
  3. 매칭 완료까지 대기 (약 30초-2분)
  4. ✅ 매칭 결과 표시 확인
  5. ✅ Big Five 점수 및 팀 구성 결과 확인
  ```

- [ ] **전체 데이터 플로우 검증**
  ```sql
  -- Railway PostgreSQL Query 탭에서 데이터 확인
  
  -- 1. 제출된 설문 데이터 확인
  SELECT COUNT(*) FROM survey_responses;
  
  -- 2. AI 매칭 결과 확인
  SELECT * FROM matching_results ORDER BY created_at DESC LIMIT 5;
  
  -- 3. 사용자 데이터 확인
  SELECT COUNT(*) FROM participants;
  ```

- [ ] **성능 테스트**
  - 페이지 로딩 시간 3초 이내 확인
  - API 응답 시간 5초 이내 확인
  - 동시 사용자 5명 테스트 (가족/친구 협조)

### 🔒 6단계: 보안 및 운영 준비

- [ ] **보안 설정 최종 확인**
  ```bash
  # 1. 강력한 시크릿 설정 확인
  # Railway Express 서비스 Variables에서:
  # ✅ JWT_SECRET: 32자 이상 랜덤 문자열
  # ✅ SESSION_SECRET: 32자 이상 랜덤 문자열
  # ✅ 기본 관리자 비밀번호 변경 완료
  
  # 2. GitHub에 민감 정보 업로드 안 됨 확인
  git log --oneline | head -5
  # .env 파일이 커밋되지 않았는지 확인
  ```

- [ ] **CORS 설정 확인**
  ```javascript
  // server-express/src/index.js에서 확인:
  // ✅ origin에 실제 프론트엔드 URL만 포함
  // ✅ localhost는 배포 시 제거 (선택사항)
  // ✅ credentials: true 설정
  ```

- [ ] **HTTPS 연결 강제 확인**
  ```bash
  # 1. HTTP로 접속 시 HTTPS로 리다이렉트 확인
  curl -I http://your-frontend.vercel.app
  # 예상: 301 또는 302 리다이렉트
  
  # 2. 모든 API 호출이 HTTPS로 이루어지는지 확인
  # 브라우저 Network 탭에서 모든 요청이 https:// 확인
  ```

- [ ] **모니터링 및 알림 설정**
  ```
  1. Railway 프로젝트 → Settings → Notifications
     - Usage alerts 활성화 (80% 사용 시 알림)
     - Deploy notifications 활성화
  
  2. Vercel 프로젝트 → Settings → Git
     - Deploy notifications 활성화
  
  3. GitHub 저장소 → Settings → Notifications
     - Security alerts 활성화
  ```

- [ ] **백업 계획 수립**
  ```sql
  -- 1. 데이터베이스 백업 스크립트 준비
  pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql
  
  -- 2. 환경변수 백업 (안전한 곳에 저장)
  # Railway 모든 환경변수를 텍스트 파일로 저장
  # Vercel 환경변수도 별도 저장
  
  -- 3. 코드 백업
  # GitHub 저장소가 주 백업
  # 로컬에도 정기적으로 pull 받기
  ```

- [ ] **커스텀 도메인 연결 (선택사항)**
  ```
  1. 도메인 구매 (예: nexeed.com)
  2. Vercel: 프로젝트 → Settings → Domains
  3. Railway: 서비스 → Settings → Domains
  4. DNS 설정 완료
  5. SSL 인증서 자동 발급 확인
  ```

---

## 🚀 다음 단계

### 운영 최적화

1. **성능 모니터링**
   - Vercel Analytics 활성화
   - Railway 메트릭스 확인
   - 사용자 행동 분석

2. **보안 강화**
   - API 키 로테이션
   - 접근 로그 모니터링
   - 보안 헤더 추가

3. **사용자 경험 개선**
   - 페이지 로딩 속도 최적화
   - 모바일 반응형 개선
   - 오류 처리 강화

### 기능 확장

1. **알림 시스템**
   - 이메일 알림
   - 실시간 알림
   - SMS 알림

2. **분석 대시보드**
   - 사용 통계
   - 성능 지표
   - 사용자 피드백

3. **API 확장**
   - 외부 시스템 연동
   - 웹훅 지원
   - API 버전 관리

---

## 💾 데이터 백업 및 복구 가이드

### 🔄 자동 백업 설정

#### PostgreSQL 데이터베이스 백업

**1. 로컬 백업 스크립트 (Windows PowerShell)**
```powershell
# backup-database.ps1
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "C:\Users\$env:USERNAME\nexeed-backups"
$DATABASE_URL = "your-railway-database-url-here"

# 백업 디렉토리 생성
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# 데이터베이스 백업 실행
Write-Host "데이터베이스 백업 시작: $DATE"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR\nexeed_backup_$DATE.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 백업 완료: nexeed_backup_$DATE.sql"
    
    # 7일 이상 된 백업 파일 삭제
    Get-ChildItem $BACKUP_DIR -Name "nexeed_backup_*.sql" | 
        Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } | 
        Remove-Item
    
    Write-Host "🗑️ 오래된 백업 파일 정리 완료"
} else {
    Write-Host "❌ 백업 실패! 데이터베이스 연결을 확인하세요."
}
```

**2. 백업 스크립트 실행 방법**
```powershell
# 1. 스크립트 파일 생성
New-Item -Path "C:\Users\$env:USERNAME\backup-database.ps1" -ItemType File

# 2. 스크립트에 위 내용 복사 후 DATABASE_URL 수정
# 3. 실행 권한 설정
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 4. 백업 실행
.\backup-database.ps1
```

**3. 자동 백업 스케줄 설정 (Windows 작업 스케줄러)**
```powershell
# 매일 오전 2시 자동 백업 설정
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Users\$env:USERNAME\backup-database.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "NEXEED Database Backup" -Action $Action -Trigger $Trigger -Settings $Settings -Description "NEXEED 데이터베이스 일일 백업"

Write-Host "✅ 자동 백업 스케줄이 설정되었습니다."
```

### 🔧 데이터 복구 절차

#### 1. 긴급 복구 (서비스 장애 시)

**단계 1: 백업 파일 확인**
```powershell
# 사용 가능한 백업 파일 목록 확인
Get-ChildItem "C:\Users\$env:USERNAME\nexeed-backups" -Name "*.sql" | Sort-Object -Descending

# 가장 최신 백업 파일 선택
$LATEST_BACKUP = (Get-ChildItem "C:\Users\$env:USERNAME\nexeed-backups" -Name "*.sql" | Sort-Object -Descending)[0]
Write-Host "복구할 백업 파일: $LATEST_BACKUP"
```

**단계 2: 데이터베이스 복구**
```bash
# Railway PostgreSQL에 백업 데이터 복원
psql "your-railway-database-url" < "C:\Users\username\nexeed-backups\nexeed_backup_20240115_140000.sql"

# 또는 Railway 대시보드에서:
# 1. PostgreSQL 서비스 → "Query" 탭
# 2. 백업 파일 내용을 복사하여 붙여넣기
# 3. "Execute" 버튼 클릭
```

**단계 3: 서비스 재시작**
```
1. Railway Express 서비스 → "Deployments" → "Redeploy"
2. Railway AI 서비스 → "Deployments" → "Redeploy"
3. Vercel 프로젝트 → "Deployments" → "Redeploy"
```

#### 2. 부분 데이터 복구

**특정 테이블만 복구하는 경우:**
```sql
-- 1. 문제가 있는 테이블 백업 (안전장치)
CREATE TABLE survey_responses_backup AS SELECT * FROM survey_responses;

-- 2. 문제 테이블 데이터 삭제
TRUNCATE TABLE survey_responses;

-- 3. 백업에서 특정 테이블만 복원
-- (백업 파일에서 해당 테이블의 INSERT 문만 추출하여 실행)

-- 4. 데이터 무결성 확인
SELECT COUNT(*) FROM survey_responses;
SELECT COUNT(*) FROM participants;
```

### 📊 백업 모니터링 및 검증

#### 백업 상태 확인 스크립트
```powershell
# backup-status.ps1
$BACKUP_DIR = "C:\Users\$env:USERNAME\nexeed-backups"
$TODAY = Get-Date -Format "yyyyMMdd"

Write-Host "=== NEXEED 백업 상태 확인 ==="
Write-Host "백업 디렉토리: $BACKUP_DIR"

# 오늘 백업 파일 확인
$TodayBackups = Get-ChildItem $BACKUP_DIR -Name "nexeed_backup_$TODAY*.sql"
if ($TodayBackups) {
    Write-Host "✅ 오늘 백업: $($TodayBackups.Count)개 파일"
    foreach ($backup in $TodayBackups) {
        $size = (Get-Item "$BACKUP_DIR\$backup").Length / 1MB
        Write-Host "   📁 $backup (크기: $([math]::Round($size, 2))MB)"
    }
} else {
    Write-Host "❌ 오늘 백업 파일이 없습니다!"
}

# 전체 백업 파일 개수
$AllBackups = Get-ChildItem $BACKUP_DIR -Name "*.sql"
Write-Host "📊 총 백업 파일: $($AllBackups.Count)개"

# 디스크 사용량
$TotalSize = (Get-ChildItem $BACKUP_DIR -Name "*.sql" | ForEach-Object { (Get-Item "$BACKUP_DIR\$_").Length } | Measure-Object -Sum).Sum / 1MB
Write-Host "💾 총 사용 공간: $([math]::Round($TotalSize, 2))MB"
```

#### 백업 무결성 테스트
```powershell
# backup-test.ps1
$LATEST_BACKUP = (Get-ChildItem "C:\Users\$env:USERNAME\nexeed-backups" -Name "*.sql" | Sort-Object -Descending)[0]

Write-Host "백업 파일 무결성 테스트: $LATEST_BACKUP"

# 백업 파일 크기 확인 (최소 1KB 이상)
$BackupSize = (Get-Item "C:\Users\$env:USERNAME\nexeed-backups\$LATEST_BACKUP").Length
if ($BackupSize -gt 1024) {
    Write-Host "✅ 백업 파일 크기 정상: $($BackupSize / 1024)KB"
} else {
    Write-Host "❌ 백업 파일이 너무 작습니다: $BackupSize bytes"
}

# 백업 파일 내용 확인 (SQL 구문 포함 여부)
$Content = Get-Content "C:\Users\$env:USERNAME\nexeed-backups\$LATEST_BACKUP" -TotalCount 10
if ($Content -match "CREATE TABLE|INSERT INTO|COPY") {
    Write-Host "✅ 백업 파일 내용 정상 (SQL 구문 포함)"
} else {
    Write-Host "❌ 백업 파일 내용 이상 (SQL 구문 없음)"
}
```

### 🚨 재해 복구 계획

#### 완전 재해 복구 시나리오

**시나리오 1: Railway 서비스 완전 장애**
```
1. 새로운 Railway 프로젝트 생성
2. PostgreSQL 데이터베이스 새로 생성
3. 최신 백업으로 데이터 복원
4. Express.js 및 FastAPI 서비스 재배포
5. 환경변수 재설정
6. Vercel 환경변수 업데이트 (새 백엔드 URL)
7. 전체 시스템 테스트
```

**시나리오 2: 데이터 손실 (악성 코드, 실수 등)**
```
1. 즉시 서비스 중단 (추가 손실 방지)
2. 손실 범위 파악
3. 가장 최근 정상 백업 선택
4. 테스트 환경에서 복구 테스트
5. 프로덕션 환경 복구
6. 데이터 무결성 검증
7. 서비스 재개
```

**복구 시간 목표 (RTO/RPO)**
- **복구 시간 목표 (RTO)**: 4시간 이내
- **복구 지점 목표 (RPO)**: 24시간 이내 (일일 백업)
- **긴급 연락망**: 관리자 이메일/전화번호 준비

---

## 📞 지원 및 문의

### 🆘 긴급 지원

**서비스 장애 시 즉시 확인사항:**
1. Railway 서비스 상태: https://status.railway.app
2. Vercel 서비스 상태: https://www.vercel-status.com
3. GitHub 서비스 상태: https://www.githubstatus.com

**긴급 복구 절차:**
1. 서비스 재시작: Railway/Vercel 대시보드에서 "Redeploy"
2. 환경변수 확인: 모든 필수 환경변수 설정 상태 점검
3. 로그 확인: 오류 메시지 및 스택 트레이스 분석
4. 백업 데이터 복구: 최신 데이터베이스 백업으로 복원

### 📧 기술 지원

**문제 보고 시 포함할 정보:**
- 발생 시간 및 빈도
- 오류 메시지 전문
- 브라우저 및 운영체제 정보
- 재현 단계
- 스크린샷 또는 동영상

**지원 채널:**
- GitHub Issues: 버그 리포트 및 기능 요청
- 이메일: 긴급 기술 지원
- 문서: 이 가이드 및 README 파일

### 🔄 정기 점검 일정

**매주 점검 (월요일):**
- [ ] 서비스 상태 확인
- [ ] 비용 사용량 검토
- [ ] 보안 알림 확인
- [ ] 백업 상태 점검 (`backup-status.ps1` 실행)
- [ ] 백업 무결성 테스트 (`backup-test.ps1` 실행)

**매월 점검 (1일):**
- [ ] 의존성 업데이트 검토
- [ ] 성능 메트릭 분석
- [ ] 보안 패치 적용
- [ ] 데이터베이스 최적화
- [ ] 백업 복구 테스트 (테스트 환경에서)

**분기별 점검 (분기 시작):**
- [ ] 전체 시스템 보안 감사
- [ ] 재해 복구 테스트 (전체 시나리오)
- [ ] 용량 계획 검토
- [ ] 문서 업데이트
- [ ] 백업 보관 정책 검토

### 공식 문서

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Next.js 문서](https://nextjs.org/docs)
- [Express.js 문서](https://expressjs.com)
- [FastAPI 문서](https://fastapi.tiangolo.com)

### 커뮤니티 지원

- [Vercel Discord](https://vercel.com/discord)
- [Railway Discord](https://discord.gg/railway)
- [Next.js GitHub](https://github.com/vercel/next.js)

---

> **🎉 축하합니다!** 
> 
> NEXEED 베타 테스트 플랫폼이 성공적으로 배포되었습니다. 
> 이제 실제 사용자들과 함께 Big Five 성격 검사 기반 팀 매칭을 테스트할 수 있습니다.
> 
> **다음 단계:** 사용자 피드백을 수집하고 서비스를 지속적으로 개선해 나가세요! 🚀
> 
> **💡 팁:** 정기적인 백업과 모니터링을 통해 안정적인 서비스 운영을 유지하세요.