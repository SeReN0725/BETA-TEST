
# NeXeed Web Frontend

> Next.js 기반 프론트엔드 - Big Five 성격 검사 및 사용자 친화적 인터페이스

## 🎨 핵심 기능

### Big Five 성격 검사 인터페이스
- **30문항 설문조사**: 과학적으로 검증된 Big Five 모델 기반
- **직관적인 UI**: 카드 기반 문항 디스플레이
- **실시간 진행률**: 사용자 친화적인 진행 상황 표시
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

### 사용자 경험 (UX)
- **단계별 가이드**: 명확한 사용자 플로우
- **실시간 검증**: 입력 데이터 즉시 검증
- **성공 피드백**: 제출 완료 시 결과 모달
- **오류 처리**: 사용자 친화적인 오류 메시지

### 데이터 시각화
- **OCEAN 점수 표시**: Big Five 성격 요소별 점수 시각화
- **진행률 바**: 설문 완료 진행 상황
- **인터랙티브 요소**: 호버 효과 및 애니메이션

## 🚀 빠른 시작

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 환경 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_COHORT_ID=1
```

## 🎯 사용자 인터페이스

### 메인 페이지 구성

#### 1. 개인정보 입력 섹션
```typescript
interface UserInfo {
  name: string;           // 이름
  email: string;          // 이메일
  student_id: string;     // 학번
  major: string;          // 전공
  year: number;           // 학년
  phone: string;          // 전화번호
}
```

**특징:**
- 실시간 입력 검증
- 이메일 형식 자동 확인
- 학번 패턴 검증
- 필수 필드 표시

#### 2. 코호트 선택
- 드롭다운 메뉴를 통한 코호트 선택
- 기본값: 코호트 1
- 동적 코호트 목록 로드 지원

#### 3. Big Five 설문 섹션
- **30개 문항**: 각 성격 요소당 6문항
- **5점 리커트 척도**: 1(전혀 그렇지 않다) ~ 5(매우 그렇다)
- **진행률 표시**: 실시간 완료 진행률
- **문항별 카드 디자인**: 가독성 향상

### Big Five 문항 구성

#### 개방성 (Openness) - Q1~Q6
- 새로운 아이디어와 경험에 대한 개방성
- 상상력과 창의성
- **역문항**: Q4, Q6

#### 성실성 (Conscientiousness) - Q7~Q12
- 계획성과 책임감
- 목표 지향성과 자기 통제
- **역문항**: Q10, Q12

#### 외향성 (Extraversion) - Q13~Q18
- 사회적 상호작용과 에너지
- 주도성과 적극성
- **역문항**: Q16, Q18

#### 우호성 (Agreeableness) - Q19~Q24
- 협력성과 신뢰성
- 공감능력과 이타성
- **역문항**: Q22, Q24

#### 신경성 (Neuroticism) - Q25~Q30
- 정서적 안정성
- 스트레스 반응과 불안 수준
- **역문항**: Q28, Q30

## 🎨 디자인 시스템

### 색상 팔레트
```css
:root {
  --primary-color: #4a6cf7;      /* 메인 브랜드 색상 */
  --primary-hover: #3a5ae8;      /* 호버 상태 */
  --text-primary: #333;           /* 주요 텍스트 */
  --text-secondary: #555;         /* 보조 텍스트 */
  --text-muted: #666;             /* 비활성 텍스트 */
  --border-color: #ddd;           /* 테두리 */
  --background-light: #f9f9f9;    /* 밝은 배경 */
  --success-color: #28a745;       /* 성공 색상 */
  --error-color: #e53e3e;         /* 오류 색상 */
}
```

### 타이포그래피
- **폰트 패밀리**: ui-sans-serif, system-ui, -apple-system
- **제목 (H1)**: 24px, 700 weight
- **부제목 (H2)**: 20px, 600 weight
- **본문**: 16px, 400 weight
- **라벨**: 14px, 500 weight
- **캡션**: 12px, 400 weight

### 컴포넌트 스타일

#### 입력 필드
```css
.input {
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: white;
}

.input:focus {
  border-color: #4a6cf7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
}

.input.error {
  border-color: #e53e3e;
}
```

#### 버튼
```css
.button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a6cf7 0%, #3a5ae8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(74, 108, 247, 0.2);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

#### 문항 카드
```css
.question-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

## 🔄 API 연동

### 백엔드 통신

#### 설문 데이터 제출
```typescript
interface SubmissionData {
  name: string;
  email: string;
  student_id: string;
  major: string;
  year: number;
  phone: string;
  big_five_answers: number[];
  availability: Record<string, string[]>;
  preferred_roles: string[];
  skills: string[];
}

const submitData = async (data: SubmissionData) => {
  try {
    const response = await fetch(`${API_BASE}/api/cohorts/${COHORT_ID}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('제출에 실패했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('제출 오류:', error);
    throw error;
  }
};
```

#### 코호트 목록 조회
```typescript
const fetchCohorts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/cohorts`);
    return await response.json();
  } catch (error) {
    console.error('코호트 조회 오류:', error);
    return [];
  }
};
```

## 📱 반응형 디자인

### 브레이크포인트
```css
/* 모바일 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
    max-width: 100%;
  }
  
  .question-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .button {
    width: 100%;
    padding: 16px;
  }
}

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    padding: 24px;
    max-width: 720px;
  }
}

/* 데스크톱 */
@media (min-width: 1025px) {
  .container {
    padding: 32px;
    max-width: 880px;
  }
}
```

### 모바일 최적화
- **터치 친화적**: 최소 44px 터치 타겟
- **스크롤 최적화**: 부드러운 스크롤 경험
- **키보드 지원**: 모바일 키보드 타입 최적화
- **성능 최적화**: 이미지 lazy loading

## 🔧 기술 스택

### 핵심 프레임워크
- **Next.js 14.2.32**: React 기반 풀스택 프레임워크
- **React 18.2.0**: 사용자 인터페이스 라이브러리
- **TypeScript 5.9.2**: 정적 타입 검사

### 개발 도구
- **@types/node**: Node.js 타입 정의
- **@types/react**: React 타입 정의
- **uuid**: 고유 식별자 생성

### 성능 최적화
- **Next.js Image**: 자동 이미지 최적화
- **Code Splitting**: 자동 코드 분할
- **SSR/SSG**: 서버 사이드 렌더링 지원

## 📁 프로젝트 구조

```
web-nextjs/
├── pages/
│   └── index.tsx         # 메인 페이지 (설문 조사)
├── components/           # 재사용 가능한 컴포넌트
│   ├── QuestionCard.tsx
│   ├── ProgressBar.tsx
│   └── SuccessModal.tsx
├── styles/              # 스타일 파일
│   ├── globals.css
│   └── components.css
├── utils/               # 유틸리티 함수
│   ├── validation.ts
│   └── api.ts
├── types/               # TypeScript 타입 정의
│   └── index.ts
├── public/              # 정적 파일
├── .next/               # Next.js 빌드 출력
├── package.json         # 의존성 및 스크립트
├── tsconfig.json        # TypeScript 설정
├── next-env.d.ts        # Next.js 타입 정의
└── README.md           # 이 문서
```

## 🎯 사용자 플로우

### 1. 페이지 로드
1. 코호트 목록 자동 로드
2. 기본 코호트 선택
3. 폼 초기화

### 2. 정보 입력
1. 개인정보 입력 및 실시간 검증
2. 코호트 선택
3. Big Five 설문 응답

### 3. 제출 및 결과
1. 데이터 검증
2. 백엔드 API 호출
3. 성공 모달 표시
4. Big Five 점수 시각화

## 🐛 문제 해결

### 일반적인 오류

#### 빌드 오류
```
Error: Cannot resolve module
```
**해결방법:**
1. `npm install` 재실행
2. `node_modules` 삭제 후 재설치
3. TypeScript 타입 정의 확인

#### API 연결 오류
```
Fetch failed: ECONNREFUSED
```
**해결방법:**
1. 백엔드 서버 실행 상태 확인
2. `.env.local` 파일의 API URL 확인
3. CORS 설정 확인

#### 스타일 적용 안됨
```
Styles not applying
```
**해결방법:**
1. CSS-in-JS 문법 확인
2. 브라우저 캐시 클리어
3. 개발자 도구에서 스타일 검사

### 성능 최적화

#### 이미지 최적화
```typescript
import Image from 'next/image';

// 최적화된 이미지 사용
<Image
  src="/logo.png"
  alt="NeXeed Logo"
  width={200}
  height={100}
  priority
  placeholder="blur"
/>
```

#### 코드 분할
```typescript
import dynamic from 'next/dynamic';

// 동적 임포트를 통한 코드 분할
const HeavyComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

## 📊 성능 모니터링

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 성능 측정 도구
```bash
# Lighthouse 분석
npx lighthouse http://localhost:3000

# Bundle 분석
npm run build
npx @next/bundle-analyzer

# 성능 프로파일링
npm run dev -- --profile
```

## 🔒 보안 고려사항

### 클라이언트 보안
- **XSS 방지**: React의 기본 XSS 보호 활용
- **입력 검증**: 클라이언트 사이드 검증
- **환경 변수**: `NEXT_PUBLIC_` 접두사로 공개 변수 관리
- **CSP 헤더**: Content Security Policy 설정

### 데이터 보호
```typescript
// 입력 검증 예시
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, '');
};
```

## 📈 향후 개선 계획

### 기능 확장
- **다국어 지원 (i18n)**: 영어, 한국어 지원
- **다크 모드**: 사용자 선호도 기반 테마
- **오프라인 모드**: Service Worker 활용
- **PWA 변환**: Progressive Web App 기능

### UX 개선
- **애니메이션 효과**: Framer Motion 도입
- **로딩 스켈레톤**: 더 나은 로딩 경험
- **드래그 앤 드롭**: 인터랙티브 요소 추가
- **음성 입력**: Web Speech API 활용

### 접근성 (A11y)
- **키보드 네비게이션**: 완전한 키보드 지원
- **스크린 리더**: ARIA 라벨 및 역할 정의
- **고대비 모드**: 시각 장애인 지원
- **포커스 관리**: 명확한 포커스 표시

---

> 💡 **팁**: 모바일에서 최적의 경험을 위해 세로 모드로 사용하세요. 설문 중간에 페이지를 새로고침해도 입력한 데이터는 보존됩니다.

> 🔗 **관련 서비스**: [백엔드 API](../server-express/README.md) | [AI 서비스](../api-fastapi/README.md)
