# 클라우드 서버 배포 가이드

## ⚠️ 보안 주의사항

### 배포 전 필수 작업

1. **환경 변수 설정**
   - `.env` 파일의 모든 비밀번호와 시크릿 키를 변경하세요
   - `server-express/.env` 파일도 업데이트하세요
   - 강력한 비밀번호와 JWT 시크릿을 사용하세요

2. **데이터베이스 보안**
   - `schema.sql`의 기본 관리자 비밀번호를 변경하세요
   - 프로덕션에서는 별도의 데이터베이스 사용자를 생성하세요

3. **네트워크 설정**
   - `docker-compose.yml`의 포트 설정을 검토하세요
   - 필요한 경우 내부 네트워크만 사용하도록 설정하세요

## 🔒 현재 발견된 보안 이슈

### 높은 우선순위
- ✅ `.gitignore` 파일 생성됨
- ✅ 환경 변수 템플릿 파일 업데이트됨
- ✅ Docker Compose 하드코딩 비밀번호 환경변수화됨
- ⚠️ `schema.sql`의 기본 관리자 비밀번호 (werty0140)
- ⚠️ JWT 시크릿 키 변경 필요
- ⚠️ 데이터베이스 비밀번호 변경 필요

### 중간 우선순위
- 🔍 HTTPS 설정 필요
- 🔍 방화벽 규칙 설정
- 🔍 로그 관리 설정

## 📋 배포 체크리스트

### 배포 전
- [ ] 모든 비밀번호 변경
- [ ] JWT 시크릿 키 생성 및 설정
- [ ] 프로덕션 도메인으로 CORS 설정 업데이트
- [ ] 데이터베이스 백업 계획 수립
- [ ] SSL/TLS 인증서 준비

### 배포 후
- [ ] 기본 관리자 계정 비밀번호 변경
- [ ] 불필요한 포트 차단
- [ ] 로그 모니터링 설정
- [ ] 정기 보안 업데이트 계획

## 🚀 배포 명령어

```bash
# 1. 환경 변수 설정 확인
cp .env.example .env
cp server-express/.env.example server-express/.env

# 2. 환경 변수 편집 (모든 비밀번호와 시크릿 변경)
vim .env
vim server-express/.env

# 3. 프로덕션 빌드 및 실행
docker-compose up --build -d

# 4. 서비스 상태 확인
docker-compose ps
docker-compose logs
```

## 🔧 프로덕션 환경 권장 설정

### 환경 변수 예시
```bash
# .env (Docker Compose용)
POSTGRES_USER=nexeed_prod
POSTGRES_PASSWORD=강력한_비밀번호_여기에
POSTGRES_DB=nexeed_production
NEXT_PUBLIC_API_URL=https://your-backend-api-domain.com

# server-express/.env
PORT=8080
POSTGRES_URL=postgresql://nexeed_prod:강력한_비밀번호_여기에@db:5432/nexeed_production
JWT_SECRET=R7x!p2vQ9wzL8mD5nJ3cF6sYt0gB4kW1uH7e
FRONTEND_URL=https://nexeed-beta-test.pages.dev
AI_BASE=http://api:8001
```

## 🌐 도메인 및 CORS 설정 가이드

### 현재 설정된 도메인
- **프론트엔드**: `https://nexeed-beta-test.pages.dev`
- **JWT 시크릿**: `R7x!p2vQ9wzL8mD5nJ3cF6sYt0gB4kW1uH7e`

### CORS 설정 확인사항

#### 1. Express 서버 CORS 설정
- `server-express/src/index.js`에서 `FRONTEND_URL` 환경변수 사용
- 현재 설정: `https://nexeed-beta-test.pages.dev`
- **중요**: 프로덕션에서는 정확한 도메인만 허용

#### 2. 프론트엔드 API 연결
- Next.js에서 `NEXT_PUBLIC_API_URL` 환경변수 사용
- 로컬 개발: `http://localhost:8080`
- 프로덕션: 백엔드 API 서버 도메인으로 설정 필요

#### 3. 배포 시나리오별 설정

**시나리오 A: 프론트엔드만 Cloudflare Pages에 배포**
```bash
# .env
NEXT_PUBLIC_API_URL=http://your-backend-server-ip:8080

# server-express/.env
FRONTEND_URL=https://nexeed-beta-test.pages.dev
```

**시나리오 B: 전체 시스템을 클라우드 서버에 배포**
```bash
# .env
NEXT_PUBLIC_API_URL=https://your-domain.com:8080

# server-express/.env
FRONTEND_URL=https://your-domain.com:3000
```

### ⚠️ CORS 관련 주의사항

1. **프로토콜 일치**: HTTP/HTTPS 프로토콜이 일치해야 함
2. **포트 명시**: 기본 포트(80, 443)가 아닌 경우 포트 번호 포함
3. **서브도메인**: `www.` 등 서브도메인도 정확히 일치해야 함
4. **와일드카드 금지**: 프로덕션에서는 `*` 사용 금지

### 🔍 연결 상태 테스트 방법

```bash
# CORS 테스트
curl -H "Origin: https://nexeed-beta-test.pages.dev" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend-domain.com:8080/api/admin/cohorts

# API 연결 테스트
curl -X GET https://your-backend-domain.com:8080/api/admin/cohorts
```

## ⚡ 현재 상태

**✅ 배포 가능**: 기본적인 보안 설정이 완료되었습니다.

**⚠️ 주의사항**: 프로덕션 배포 전에 반드시 모든 비밀번호와 시크릿 키를 변경하세요.

**권장사항**: 추가 보안 강화를 위해 리버스 프록시(Nginx), SSL 인증서, 방화벽 설정을 고려하세요.