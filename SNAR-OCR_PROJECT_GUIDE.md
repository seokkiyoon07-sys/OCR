# SNAR-OCR 프로젝트 가이드

## 📋 프로젝트 개요

SNAR-OCR은 SN독학기숙학원에서 제공하는 한국 수능/모의고사 답안지를 OCR로 자동 채점하는 웹 애플리케이션입니다.

### 기술 스택
- **프레임워크**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5
- **스타일링**: Tailwind CSS 4 with @tailwindcss/postcss
- **아이콘**: Lucide React
- **빌드 도구**: Turbopack

### 브랜딩
- **제공기관**: SN독학기숙학원
- **서비스명**: SNar OCR 채점기
- **브랜드 컬러**: 블루 (#2563eb) - SN독학기숙학원 브랜드 컬러
- **로고**: 검은색 사각형 + "SNar OCR 채점기" + "by SN독학기숙학원"

---

## 🎨 디자인 시스템

### 색상 팔레트

#### 기본 색상
```css
배경: #ffffff (흰색)
테두리: #f5f5f5 (매우 연한 회색 - 거의 보이지 않게)
점선 테두리: #f0f0f0
텍스트 기본: #000000
텍스트 보조: #666666, #999999
```

#### 브랜드 색상
```css
블루 (정보/총점):
- 배경: #eff6ff (blue-50)
- 테두리: #bfdbfe (blue-200)
- 텍스트: #2563eb (blue-600), #1d4ed8 (blue-700)

레드 (오답):
- 배경: #fef2f2 (red-50)
- 테두리: #fecaca (red-200)
- 텍스트: #dc2626 (red-600), #b91c1c (red-700)

그린 (정답):
- 배경: #f0fdf4 (green-50)
- 테두리: #bbf7d0 (green-200)
- 텍스트: #16a34a (green-600), #15803d (green-700)

오렌지 (탐구):
- 배경: #fff7ed (orange-50)
- 테두리: #fed7aa (orange-200)
- 텍스트: #ea580c (orange-600), #c2410c (orange-700)

회색 (중립):
- neutral-50, neutral-100 (배경)
- neutral-600 (보조 텍스트)
- neutral-800 (버튼)
```

### 타이포그래피

```css
제목 (대): text-xl font-semibold (20px, 600)
제목 (중): text-lg font-semibold (18px, 600)
제목 (소): text-base font-semibold (16px, 600)
본문 (기본): text-sm (14px)
본문 (작음): text-xs (12px)
설명/캡션: text-xs text-neutral-500 (12px, 회색)
```

### 간격 시스템

```css
섹션 간격: space-y-6 (24px)
카드 내부 패딩: p-6 (24px)
카드 간격: gap-6 (24px)
필드 간격: space-y-3 (12px)
요소 간 작은 간격: gap-2, gap-3 (8px, 12px)
```

### Border Radius

```css
카드: rounded-2xl (16px)
버튼/입력필드: rounded-xl (12px)
작은 요소: rounded-lg (8px)
체크박스: rounded (4px)
```

### 컴포넌트 스타일

#### 버튼
```tsx
// Primary 버튼 (검정)
className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800"

// Secondary 버튼 (테두리)
className="px-4 py-2 rounded-xl border hover:bg-neutral-50"

// 링크 버튼
className="text-blue-600 hover:underline"
```

#### 입력 필드
```tsx
// 기본 입력
className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// 체크박스
className="rounded"
```

#### 카드
```tsx
// 기본 카드
className="rounded-2xl border bg-white"

// 점수 카드 (강조)
className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200"
```

#### 드롭다운
```tsx
// 드롭다운 버튼
className="w-full rounded-xl border px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-neutral-50"

// 드롭다운 메뉴
className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border bg-white shadow-lg max-h-80 overflow-y-auto"

// 드롭다운 아이템
className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b"
```

---

## 📁 프로젝트 구조

```
C:\code\snar-ocr\
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 랜딩 페이지
│   │   ├── upload/page.tsx             # 업로드 페이지
│   │   ├── results/page.tsx            # 채점 결과 페이지
│   │   ├── pricing/page.tsx            # 가격 정책 페이지
│   │   ├── faq/page.tsx                # FAQ 페이지
│   │   ├── globals.css                 # 글로벌 스타일
│   │   └── layout.tsx                  # 루트 레이아웃
│   ├── components/
│   │   └── SNarOCRLayout.tsx           # 공통 레이아웃 컴포넌트
│   └── hooks/
│       └── useSNarOCRNavigation.ts     # 네비게이션 훅
├── DESIGN_SYSTEM.md                    # 디자인 시스템 문서
└── SNAR-OCR_PROJECT_GUIDE.md          # 이 문서
```

---

## 🔧 주요 페이지 설명

### 1. 랜딩 페이지 (`/`)
- Hero 섹션: 서비스 소개 및 주요 CTA
- 주요 기능 3가지 소개 (빠른 채점, 정확한 인식, 상세 분석)
- 사용 방법 4단계 가이드
- FAQ 섹션

### 2. 업로드 페이지 (`/upload`)

#### 파일 업로드 영역
```tsx
// 점선 테두리 업로드 박스
<div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: '#f0f0f0' }}>
  <Upload icon />
  <div>이미지나 PDF를 업로드 해주세요</div>
  <button>파일 선택</button>
</div>
```

#### 과목 선택 (드롭다운)
- 국어 (45문항)
- 수학 (30문항) 
- 영어 (45문항)
- 탐구 (20문항)
- 기타 (직접 입력)

**상태 관리:**
```tsx
const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
const [selectedSubject, setSelectedSubject] = useState('과목을 선택하세요');
const [customQuestionCount, setCustomQuestionCount] = useState('');
const isCustomSubject = selectedSubject === '기타';
```

#### 시험 선택 (모달)
- 시행년도: 2020-2025학년도
- 시행월: 3월, 6월, 9월, 11월
- 출제기관: 평가원, 교육청, 기타(직접입력)
- 학년: 자유 입력

#### 정답지 입력 (모달)
- **수학**: 공통 객관식(1-15) + 공통 주관식(16-22) + 선택 객관식(23-28) + 선택 주관식(29-30)
- **국어/영어/탐구**: 객관식만 (5문항씩 그룹화)
- **기타**: 객관식 + 주관식 혼합
- **자동 포커스**: 5칸 입력 완료 시 다음 그룹으로 자동 이동

#### 기존 정답 찾기 (모달)
- 시험지명 검색
- 과목 선택
- 검색 결과 표시
- 정답 불러오기 기능

#### 채점 구간 설정 (모달)
- **페이지 정보**: 파일명, 총 페이지, 현재 페이지
- **페이지 네비게이션**: 이전/다음 버튼, 페이지 번호 입력
- **기본 정보**: 이름, 학번, 과목번호 (2개까지 선택)
- **객관식 영역**: 블록 방식, 화살표로 개수 조절 (최대 10개)
- **주관식 영역**: 블록 방식, 화살표로 개수 조절 (최대 20개)

#### 가이드 텍스트
- "곡률 없이 평평하게, 빛 반사 없이, 테두리가 선명하게 촬영해 주세요."
- "PDF는 300dpi 이상 권장, 다중 페이지 지원."
- "객관식/서술형 혼합 시 서술형은 별도 검토 단계가 열립니다."

#### 레이아웃 구조
```
Row 1: [시험 선택] | [과목 선택]
Row 2: [정답지] (정답 입력 + 기존 정답 찾기)
Row 3: [문항 수] (기타 선택 시에만 표시)
Row 4: [메모]
Row 5: [샘플 파일 사용] [채점 구간 설정]
```

### 3. 채점 결과 페이지 (`/results`)

#### 최근 채점한 시험지 (맨 위)
- 3개의 최신 시험지 표시
- 시험지명, 날짜, 점수, 과목 태그
- 진행률 바와 색상별 점수 표시
- "더 많은 시험지 보기" 버튼 (모달)

#### 레이아웃
- 좌측 사이드바 (lg:grid-cols-4의 1칸) - 점수 카드
- 우측 메인 영역 (lg:grid-cols-4의 3칸) - 상세 결과

#### 점수 카드
```tsx
// 총점
<div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
  <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
  <div className="text-sm text-blue-700 font-medium">총점</div>
</div>

// 정답 수
<div className="rounded-xl bg-green-50 p-4 border-2 border-green-200">
  <div className="text-3xl font-bold text-green-600">{correctCount}</div>
  <div className="text-sm text-green-700 font-medium">정답</div>
</div>

// 오답 수
<div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
  <div className="text-3xl font-bold text-red-600">{wrongCount}</div>
  <div className="text-sm text-red-700 font-medium">오답</div>
</div>
```

#### 문제별 결과 그리드
- 50문항 표시
- 정답: 초록색 배경
- 오답: 빨간색 배경
- 미응답: 회색 배경

```tsx
<div className="grid grid-cols-10 gap-2">
  {Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`
        aspect-square rounded-lg flex items-center justify-center text-sm font-medium
        ${status === 'correct' ? 'bg-green-100 text-green-700' : ''}
        ${status === 'wrong' ? 'bg-red-100 text-red-700' : ''}
        ${status === 'unanswered' ? 'bg-neutral-100 text-neutral-500' : ''}
      `}
    >
      {i + 1}
    </div>
  ))}
</div>
```

#### 오답노트 (시험명 중심)
- **시험별 그룹화**: 각 시험지별로 오답노트 정리
- **상세 정보**: 시험명, 날짜, 과목, 오답 수/총 문항 수
- **틀린 문항**: 빨간색으로 강조 표시
- **문제 유형**: 문법, 독해, 미적분 등 분류
- **상세보기**: 틀린 문제의 구체적인 내용 표시

### 4. 가격 정책 페이지 (`/pricing`)
- **2가지 요금제**: Free, Academy
- **Free**: ₩0, 월 100채점, 기본 분석, 오답노트
- **Academy**: 개당 100원, 반/학년 대시보드, SSO/초대코드, API 연동
- 각 카드는 `rounded-2xl border bg-white`

### 5. FAQ 페이지 (`/faq`)
- 아코디언 스타일 FAQ
- 문의 폼 (이메일, 제목, 내용)

---

## 🎯 디자인 원칙

### 1. 미니멀리즘
- 테두리는 거의 보이지 않게 (#f5f5f5)
- 불필요한 장식 최소화
- 여백을 활용한 깔끔한 레이아웃

### 2. 명확성
- 색상으로 정보 구분 (정답=초록, 오답=빨강, 정보=파랑)
- 명확한 버튼 텍스트
- 직관적인 아이콘 사용

### 3. 일관성
- 모든 카드는 `rounded-2xl`
- 모든 버튼/입력은 `rounded-xl`
- 동일한 간격 시스템 사용 (space-y-6, gap-3 등)

### 4. 반응형
- 모바일 우선 설계
- md: 브레이크포인트에서 2열 그리드
- lg: 브레이크포인트에서 더 넓은 레이아웃

---

## 🔄 네비게이션 시스템

### useSNarOCRNavigation 훅
```tsx
import { useRouter } from 'next/navigation';

export function useSNarOCRNavigation() {
  const router = useRouter();

  const navigateTo = (page: string) => {
    const routes: Record<string, string> = {
      home: '/',
      upload: '/upload',
      results: '/results',
      pricing: '/pricing',
      faq: '/faq',
    };
    router.push(routes[page] || '/');
  };

  return { navigateTo };
}
```

### 사용 예시
```tsx
const { navigateTo } = useSNarOCRNavigation();
<button onClick={() => navigateTo('results')}>채점 시작</button>
```

---

## 📝 중요 구현 포인트

### 1. 드롭다운 레이아웃 시프트 방지
```tsx
// 잘못된 예 (레이아웃 시프트 발생)
<div className="space-y-1">
  <label>과목 선택</label>
  <div className="relative">
    <button>...</button>
    {isOpen && <div className="absolute">...</div>}
  </div>
</div>

// 올바른 예 (레이아웃 시프트 없음)
<div className="space-y-1">
  <label>과목 선택</label>
  <div className="relative">
    <button>...</button>
    {isOpen && <div className="absolute top-full">...</div>}
  </div>
</div>
```

### 2. 모달 배경 투명도
- 너무 어둡지 않게: `bg-opacity-20` 사용
- 뒤의 콘텐츠가 보이도록

### 3. 조건부 렌더링
- "기타" 과목 선택 시에만 문항 수 입력 표시
- 정답지 입력 버튼은 항상 표시

### 4. 테두리 색상
- 기본: #f5f5f5 (globals.css에서 전역 설정)
- 점선: #f0f0f0 (인라인 스타일)
- 강조 카드: border-2 사용

---

## 🚀 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint
```

### 개발 서버 접속
- URL: http://localhost:3003 (포트 3000 사용 중이어서 3003으로 변경)
- 페이지:
  - http://localhost:3003/ (랜딩)
  - http://localhost:3003/upload (업로드)
  - http://localhost:3003/results (결과)
  - http://localhost:3003/pricing (가격)
  - http://localhost:3003/faq (FAQ)

---

## 🏢 브랜딩 및 푸터

### 헤더 브랜딩
- **로고**: 검은색 사각형 + "SNar OCR 채점기"
- **서브타이틀**: "by SN독학기숙학원" (블루 컬러)
- **위치**: 헤더 좌측 상단

### 푸터 정보
- **메인 텍스트**: "SNarOCR 채점기 - powered by SN독학기숙학원"
- **저작권**: "© 2025 SN독학기숙학원"
- **설명**: "AI 기반 수능 채점 솔루션"
- **위치**: 페이지 하단, 모든 페이지에 표시

### SEO 메타데이터
- **제목**: "SNar OCR - 수능 특화 OCR 채점기 | SN독학기숙학원"
- **설명**: "SN독학기숙학원의 수능/모의고사 답안지를 OCR로 자동 채점하는 AI 서비스"
- **작성자**: SN독학기숙학원

---

## ⚠️ 주의사항

### 1. 파일 경로
- 모든 import는 절대 경로 사용 (`@/` alias)
- 예: `import SNarOCRLayout from '@/components/SNarOCRLayout'`

### 2. Client Components
- 상호작용이 필요한 컴포넌트는 `'use client'` 지시자 필수
- useState, 이벤트 핸들러 사용 시 필수

### 3. 스타일링
- Tailwind 클래스 사용 우선
- 특수한 경우에만 인라인 스타일 사용 (예: borderColor: '#f0f0f0')

### 4. 접근성
- 모든 입력 필드에 label 제공
- 버튼에 명확한 텍스트
- focus 상태 시각화 (focus:ring-2)

---

## 📚 참고 문서

- [Next.js 15 문서](https://nextjs.org/docs)
- [Tailwind CSS 4 문서](https://tailwindcss.com/docs)
- [Lucide React 아이콘](https://lucide.dev/)
- [프로젝트 디자인 시스템](./DESIGN_SYSTEM.md)

---

## 🎯 사용자 피드백 기록

### 주요 디자인 변경 사항
1. **테두리 색상**: 검정 → 매우 연한 회색 (#f5f5f5)
2. **업로드 버튼**: "이미지 선택" + "PDF 선택" → "파일 선택" (통합)
3. **시험 선택**: 드롭다운 → 모달 (더 상세한 정보 입력)
4. **과목 분류**: 날짜 기반 → 과목 기반 (국어/수학/영어/탐구/기타)
5. **정답 입력**: 개별 입력 → 그룹화된 입력 (5문항씩)
6. **자동 포커스**: 5칸 입력 완료 시 다음 그룹으로 자동 이동
7. **인식 옵션 제거**: 불필요한 옵션 제거로 UI 간소화
8. **가이드 텍스트**: "곡률 없이 평평하게, 빛 반사 없이, 테두리가 선명하게 촬영해 주세요."
9. **요금제 간소화**: 3개 → 2개 요금제 (Pro 제거, Academy "개당 100원")
10. **채점 결과**: 최근 시험지를 맨 위로 이동, 시험명 중심 오답노트
11. **채점 구간 설정**: 대형 모달로 PDF 페이지 탐색 및 구간 선택
12. **브랜딩 추가**: SN독학기숙학원 브랜딩 (헤더, 푸터, SEO)
13. **탭 기반 입력**: 정답 입력 → 배점 입력 2단계 프로세스
14. **보안 강화**: 입력 검증, XSS 방지, 파일 업로드 보안
15. **SEO 최적화**: 사이트맵, 메타데이터, Open Graph, Twitter Card

### 사용자 선호 패턴
- 심플하고 깔끔한 UI
- 어두운 테두리/배경 지양
- 직관적인 모달 사용 (상세 정보 입력 시)
- 유연한 입력 옵션 (커스터마이징 가능)
- 자동화된 사용자 경험 (자동 포커스 이동)
- 블록 방식의 구간 선택

---

## 💡 다음 개발자를 위한 팁

1. **일관성 유지**: 디자인 시스템을 참고하여 색상/간격/반경 통일
2. **재사용성**: 반복되는 패턴은 컴포넌트로 분리 고려
3. **상태 관리**: 복잡해지면 Context API나 Zustand 도입 검토
4. **타입 안정성**: TypeScript 타입 정의 철저히
5. **테스트**: 주요 기능에 대한 테스트 코드 작성 권장

---

**문서 버전**: 3.0
**최종 업데이트**: 2025-01-11
**프로젝트**: SNAR-OCR (수능 OCR 자동 채점 시스템) - SN독학기숙학원

---

## 🚀 최신 개발 완료 기능

### ✅ 완료된 주요 기능
1. **업로드 페이지**: 파일 업로드, 과목/시험 선택, 탭 기반 정답/배점 입력, 기존 정답 찾기, 채점 구간 설정
2. **채점 결과 페이지**: 최근 시험지 목록, 점수 카드, 문항별 결과, 시험명 중심 오답노트
3. **요금제 페이지**: 2개 요금제 (Free, Academy)
4. **모달 시스템**: 시험 선택, 정답/배점 입력, 기존 정답 찾기, 채점 구간 설정, 더 많은 시험지 보기
5. **탭 기반 입력**: 1단계 정답 입력 → 2단계 배점 입력 프로세스
6. **자동화 기능**: 정답 입력 시 자동 포커스 이동
7. **브랜딩 시스템**: SN독학기숙학원 브랜딩 (헤더, 푸터, SEO)
8. **보안 시스템**: 입력 검증, XSS 방지, 파일 업로드 보안
9. **SEO 최적화**: 사이트맵, 메타데이터, Open Graph, Twitter Card
10. **반응형 디자인**: 모바일/태블릿/데스크톱 지원

### 🔧 기술적 특징
- **Next.js 15 + React 19**: 최신 프레임워크 사용
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS 4**: 모던 스타일링
- **탭 기반 UX**: 2단계 정답/배점 입력 프로세스
- **모달 기반 UX**: 상세 정보 입력을 위한 직관적 모달
- **자동화된 사용자 경험**: 입력 완료 시 자동 포커스 이동
- **보안 강화**: 입력 검증, XSS 방지, 파일 업로드 보안
- **SEO 최적화**: 완전한 SEO 메타데이터 및 사이트맵
- **브랜딩 통합**: SN독학기숙학원 브랜딩 일관성
- **백엔드 연동 준비**: Python 백엔드 연동을 위한 구조 완성

### 🎨 UI/UX 개선사항
- **2단계 탭 인터페이스**: 정답 입력(파란색) → 배점 입력(초록색)
- **시각적 구분**: 각 단계별 색상 테마 및 안내 메시지
- **사용자 친화적 프로세스**: 명확한 단계별 진행
- **브랜드 일관성**: SN독학기숙학원 브랜딩 통합
- **접근성 개선**: 키보드 네비게이션, 스크린 리더 지원
- **성능 최적화**: 지연 로딩, 메모이제이션, 가상화

---

## 🔒 보안 및 안정성

### 보안 기능
- **입력 검증**: 모든 사용자 입력에 대한 검증 및 정리
- **XSS 방지**: HTML 이스케이프 및 CSP 헤더
- **파일 업로드 보안**: 파일 타입, 크기 제한 및 검증
- **CSRF 보호**: 토큰 기반 보안
- **SQL 인젝션 방지**: 입력값 정리 및 검증

### 안정성 기능
- **에러 핸들링**: 포괄적인 에러 처리 및 사용자 친화적 메시지
- **타입 안전성**: TypeScript로 컴파일 타임 오류 방지
- **입력 검증**: 실시간 입력값 검증 및 정리
- **상태 관리**: 안전한 상태 업데이트 및 동기화

### 성능 최적화
- **지연 로딩**: 이미지 및 컴포넌트 지연 로딩
- **메모이제이션**: 불필요한 리렌더링 방지
- **가상화**: 대용량 리스트 최적화
- **디바운스/쓰로틀**: 사용자 입력 최적화

### 접근성 개선
- **키보드 네비게이션**: 모든 인터랙션 키보드 지원
- **스크린 리더**: ARIA 라벨 및 라이브 영역
- **색상 대비**: 자동 대비 검사
- **포커스 관리**: 논리적 포커스 순서

---

## 📈 SEO 및 마케팅

### SEO 최적화
- **메타데이터**: 완전한 SEO 메타데이터 설정
- **사이트맵**: 자동 생성되는 XML 사이트맵
- **로봇 설정**: 검색엔진 크롤링 최적화
- **구조화된 데이터**: 검색 결과 향상

### 소셜 미디어 최적화
- **Open Graph**: Facebook, LinkedIn 공유 최적화
- **Twitter Card**: 트위터 공유 최적화
- **이미지 최적화**: 소셜 미디어용 이미지 자동 생성

### 브랜딩 통합
- **SN독학기숙학원 브랜딩**: 일관된 브랜드 아이덴티티
- **헤더/푸터**: 모든 페이지에 브랜딩 표시
- **SEO 메타데이터**: 브랜드명 포함된 제목 및 설명
