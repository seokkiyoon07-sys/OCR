# 📐 SNar OCR 디자인 시스템

HTML 원본을 기반으로 한 완전한 디자인 가이드입니다.

---

## 🎨 1. 색상 시스템 (Color Palette)

### 기본 색상 (Neutrals)
```css
배경: bg-neutral-50 (연한 회색)
카드: bg-white
텍스트 기본: text-neutral-700
텍스트 보조: text-neutral-600
텍스트 비활성: text-neutral-500
테두리: border (기본 회색)
```

### 의미별 색상 (Semantic Colors)

#### Primary (Black)
```css
버튼 배경: bg-black
텍스트: text-white
호버: hover:bg-neutral-800
```

#### Blue (정보/선택)
```css
배경: bg-blue-50, bg-blue-100
텍스트: text-blue-600, text-blue-700, text-blue-800
테두리: border-blue-200, border-blue-300, border-blue-600
호버: hover:bg-blue-50
```

#### Red (오답/경고)
```css
배경: bg-red-50, bg-red-100
텍스트: text-red-600, text-red-700, text-red-800
테두리: border-red-200, border-red-400, border-red-600
```

#### Green (정답/성공)
```css
배경: bg-green-50, bg-green-100
텍스트: text-green-600, text-green-700, text-green-800
테두리: border-green-200, border-green-400, border-green-600
호버: hover:bg-green-50, hover:bg-green-700
```

#### Orange (탐구과목)
```css
배경: bg-orange-100
텍스트: text-orange-800
```

#### Purple (영어)
```css
배경: bg-purple-100
텍스트: text-purple-800
```

#### Yellow (프리미엄 기능)
```css
배경: bg-yellow-100
텍스트: text-yellow-800
```

#### Gray (중립/비활성)
```css
배경: bg-gray-50, bg-gray-100
텍스트: text-gray-600, text-gray-800
테두리: border-gray-200
```

---

## 📏 2. 레이아웃 & 간격 (Spacing)

### 컨테이너
```css
최대 너비: max-w-7xl
좌우 패딩: px-4
상하 패딩: py-6
```

### 그리드 레이아웃
```css
사이드바: md:grid-cols-[260px_1fr]
2열: md:grid-cols-2
3열: md:grid-cols-3
4열: lg:grid-cols-4
간격: gap-6, gap-4, gap-3, gap-2
```

### 간격 (Spacing)
```css
섹션 간격: space-y-6
카드 내부: space-y-4, space-y-3
작은 간격: space-y-1
수평 간격: gap-2, gap-3
```

---

## 🔲 3. Border Radius

```css
초대형: rounded-2xl (카드 외곽)
대형: rounded-xl (버튼, 인풋, 내부 카드)
중형: rounded-lg (작은 버튼, select)
작은 태그: rounded-full (배지)
체크박스: rounded
```

---

## 📦 4. 테두리 (Borders)

### 테두리 굵기
```css
기본: border (1px)
강조: border-2 (2px, 점수카드, 내보내기 버튼)
구분선: border-b (하단 구분선)
점선: border-dashed (드래그 앤 드롭 영역)
```

### 테두리 스타일
```css
왼쪽 강조선: border-l-4 (알림/메시지)
```

---

## 📝 5. 타이포그래피 (Typography)

### 폰트 크기
```css
3xl: text-3xl (32점 이상 숫자)
2xl: text-2xl (24점 통계 숫자)
xl: text-xl (페이지 제목)
lg: text-lg (섹션 제목, H2/H3)
base: text-base (기본 텍스트)
sm: text-sm (보조 텍스트, 설명)
xs: text-xs (라벨, 캡션)
```

### 폰트 굵기
```css
font-bold: 제목 숫자 (통계)
font-semibold: 제목, 강조 텍스트
font-medium: 라벨, 탭, 버튼
(기본): 일반 텍스트
```

---

## 🔘 6. 버튼 스타일

### Primary 버튼
```jsx
{/* Black Primary */}
<button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800">
  버튼 텍스트
</button>
```

### Secondary 버튼
```jsx
{/* Border Only */}
<button className="px-4 py-2 rounded-xl border hover:bg-neutral-50">
  버튼 텍스트
</button>
```

### Colored 버튼 (내보내기 등)
```jsx
{/* Blue */}
<button className="px-4 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium">
  PDF 내보내기
</button>

{/* Green */}
<button className="px-4 py-2 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium">
  CSV 내보내기
</button>

{/* Solid Green */}
<button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
  확인
</button>
```

### 작은 버튼 (테이블 내)
```jsx
<button className="px-3 py-1 text-xs rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50">
  보기
</button>
```

### 헤더 버튼
```jsx
{/* 일반 */}
<button className="px-3 py-2 text-sm rounded-lg hover:bg-neutral-100">
  요금제
</button>

{/* Primary */}
<button className="px-3 py-2 text-sm rounded-xl bg-black text-white">
  로그인
</button>
```

---

## 🏷️ 7. 배지 (Badges)

### 과목 배지
```jsx
{/* 수학 */}
<span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">수학</span>

{/* 국어 */}
<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">국어</span>

{/* 영어 */}
<span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">영어</span>

{/* 과학탐구 */}
<span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">과학탐구</span>

{/* 사회탐구 */}
<span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">사회탐구</span>

{/* 한국사 */}
<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">한국사</span>

{/* 프리미엄 */}
<span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">SNarGPT</span>

{/* Beta */}
<span className="hidden rounded-full border px-2 py-0.5 text-xs text-neutral-600 md:inline-block">Beta</span>
```

### 카운트 배지
```jsx
<span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">총 6건</span>
```

---

## 📊 8. 카드 스타일

### 기본 카드
```jsx
<div className="rounded-2xl border bg-white">
  <div className="p-6 border-b">
    <h3 className="text-lg font-semibold">제목</h3>
  </div>
  <div className="p-6">
    내용
  </div>
</div>
```

### 점수 카드 (강조)
```jsx
{/* 총점 (파란색) */}
<div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
  <div className="text-3xl font-bold text-blue-600">85</div>
  <div className="text-sm text-blue-700 font-medium">총점</div>
</div>

{/* 오답 (빨간색) */}
<div className="rounded-xl bg-red-50 p-4 border-2 border-red-200">
  <div className="text-3xl font-bold text-red-600">15</div>
  <div className="text-sm text-red-700 font-medium">오답</div>
</div>
```

### 정보 카드 (회색 배경)
```jsx
<div className="rounded-xl border-2 border-gray-200 p-4 bg-gray-50">
  <div className="text-sm text-gray-600 mb-2 font-medium">틀린 문항:</div>
  <div className="text-base font-bold text-red-600">3, 7, 12</div>
</div>
```

### 작은 카드 (안내)
```jsx
<div className="rounded-xl border p-4">
  <div className="text-sm font-semibold">최소 수집 원칙</div>
  <p className="text-xs text-neutral-600">설명 텍스트</p>
</div>
```

---

## 📥 9. 폼 요소 (Form Elements)

### Input
```jsx
<input className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="텍스트" />
```

### Select
```jsx
{/* 일반 */}
<select className="w-full rounded-xl border px-3 py-2 text-sm">
  <option>옵션</option>
</select>

{/* Focus Ring */}
<select className="px-3 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option>옵션</option>
</select>
```

### Textarea
```jsx
<textarea className="w-full rounded-xl border px-3 py-2 h-32" placeholder="내용"></textarea>
```

### Checkbox
```jsx
<label className="inline-flex items-center gap-2">
  <input type="checkbox" className="rounded" />
  이미지 향상
</label>
```

### Radio Button
```jsx
<label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-neutral-50">
  <input type="radio" name="group" value="option" />
  <span className="text-sm">옵션 텍스트</span>
</label>
```

### Label
```jsx
<label className="text-sm font-medium">라벨 텍스트</label>
```

---

## 📋 10. 테이블

```jsx
<table className="w-full text-left text-sm">
  <thead>
    <tr className="text-neutral-500 border-b">
      <th className="py-3 px-2">제목</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-t hover:bg-gray-50">
      <td className="py-3 px-2">내용</td>
      <td className="py-3 px-2 font-semibold text-green-600">92점</td>
      <td className="py-3 px-2 text-red-600">6개</td>
    </tr>
  </tbody>
</table>
```

---

## 🎭 11. 모달 (Modal)

```jsx
<div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
  <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col">
    {/* Header */}
    <div className="flex-shrink-0 p-6 border-b">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">제목</h3>
        <button className="px-2 py-1 text-sm rounded-lg hover:bg-neutral-100">닫기</button>
      </div>
    </div>
    {/* Body (스크롤 가능) */}
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      내용
    </div>
  </div>
</div>
```

---

## 🎯 12. 호버 & 상호작용

```css
버튼 호버: hover:bg-neutral-50, hover:bg-neutral-100, hover:bg-neutral-800
색상 호버: hover:bg-blue-50, hover:bg-green-50
테이블 행: hover:bg-gray-50
포커스: focus:ring-2 focus:ring-blue-500 focus:border-transparent
커서: cursor-pointer
```

---

## 📐 13. 헤더

```jsx
<header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-black"></div>
      <div className="text-lg font-semibold">SNar OCR 채점기</div>
      <span className="hidden rounded-full border px-2 py-0.5 text-xs text-neutral-600 md:inline-block">Beta</span>
    </div>
    <div className="flex items-center gap-2">
      {/* 버튼들 */}
    </div>
  </div>
</header>
```

---

## 🎨 14. 알림/메시지

```jsx
{/* 오답 메시지 (빨강) */}
<div className="text-sm bg-red-50 text-red-800 p-2 rounded border-l-4 border-red-400">
  오답입니다
</div>

{/* 정답 메시지 (초록) */}
<div className="text-sm bg-green-50 text-green-800 p-2 rounded border-l-4 border-green-400">
  정답입니다
</div>
```

---

## 📱 15. 사이드바 네비게이션

```jsx
<nav className="space-y-1">
  {/* Active 상태 */}
  <button className="w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 bg-black text-white">
    <Home size={16} />
    홈
  </button>

  {/* Inactive 상태 */}
  <button className="w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 hover:bg-neutral-100">
    <Upload size={16} />
    채점 업로드
  </button>
</nav>
```

---

## ✅ 핵심 디자인 원칙

1. **일관성**: 모든 rounded는 xl (12px) 기본, 카드는 2xl (16px)
2. **계층구조**: border-b로 헤더와 본문 분리
3. **색상 의미**: Blue=정보, Red=오답, Green=성공, Orange=탐구
4. **간격**: 6 > 4 > 3 > 2 > 1 순서로 사용
5. **호버 효과**: 모든 인터랙티브 요소에 hover 적용
6. **접근성**: label 태그 사용, focus ring 적용

---

## 🎯 사용 예시

### 페이지 레이아웃 템플릿
```jsx
<SNarOCRLayout currentPage="pagename">
  <section className="space-y-6">
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold">페이지 제목</h2>
        <p className="text-sm text-neutral-600">설명 텍스트</p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">섹션 제목</h3>
          </div>
          <div className="p-6">
            내용
          </div>
        </div>
      </div>
    </div>
  </section>
</SNarOCRLayout>
```

---

## 📦 컴포넌트 분리 제안

재사용 가능한 컴포넌트로 분리하면 좋은 요소들:

1. **Badge.tsx** - 과목 배지
2. **ScoreCard.tsx** - 점수 카드 (파란색/빨간색)
3. **Button.tsx** - 다양한 버튼 variants
4. **Card.tsx** - 기본 카드 래퍼
5. **Modal.tsx** - 모달 래퍼
6. **Table.tsx** - 테이블 컴포넌트
7. **Input.tsx** - 폼 인풋 컴포넌트

---

## 🔄 마이그레이션 체크리스트

- [ ] 모든 border-radius를 xl/2xl로 통일
- [ ] 색상 시스템 적용 (Blue/Red/Green/Orange)
- [ ] 버튼에 hover 상태 추가
- [ ] 폼 요소에 focus ring 추가
- [ ] 카드에 border-b 헤더 구분선 추가
- [ ] 타이포그래피 크기/굵기 통일
- [ ] 간격 시스템 적용 (space-y-6/4/3/1)
- [ ] 테이블에 hover 상태 추가
- [ ] 모달 구조 통일
- [ ] 배지 스타일 통일

---

**버전**: 1.0
**마지막 업데이트**: 2025-10-14
**기준**: snocr_250917_1 (1).html
