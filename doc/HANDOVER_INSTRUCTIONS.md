# 📋 다음 개발자를 위한 인계 사항 (Handover Notes)

현재 `feature/ui-improvements` 브랜치에는 **프론트엔드 UI 개발 및 테스트**를 위해 임시로 구현된 기능(Mocking, Auth Bypass)들이 포함되어 있습니다.
**실제 백엔드 연동 및 상용 배포 전**에 반드시 아래 사항들을 확인하고 조치해 주세요.

---

## 🚨 필수 조치 사항 (Action Items)

### 1. 인증 우회 코드 삭제 (Security)
개발 편의를 위해 로그인 절차를 건너뛰는 코드가 포함되어 있습니다. 배포 시 **심각한 보안 취약점**이 될 수 있으므로 반드시 삭제해야 합니다.
- **[수정]** `src/contexts/AuthContext.tsx`: `bypassAuth` 함수 및 관련 로직 삭제.
- **[수정]** `src/components/auth/AuthModal.tsx`: "개발자 로그인 (Bypass)" 버튼 삭제.

### 2. Mock API 제거 및 프록시 복구 (Backend Integration)
UI 테스트를 위해 Next.js App Router 내부에 가짜 API(`src/app/api/*`)를 만들었습니다. 실제 Python 백엔드(`FastAPI`, `Django` 등)와 연동하려면 이를 삭제하고 프록시 설정을 원복해야 합니다.

- **[삭제]** `src/app/api/upload/route.ts` (가짜 업로드)
- **[삭제]** `src/app/api/layout/route.ts` (가짜 레이아웃 저장)
- **[삭제]** `src/app/api/grade/route.ts` (가짜 채점 로직)
- **[삭제]** `src/app/api/templates/*` (가짜 템플릿 목록/상세)
- **[삭제]** `public/mock_paper.png` (테스트용 더미 이미지)

### 3. `next.config.js` 프록시 설정 원복
Mock API 충돌을 방지하기 위해 `next.config.js`의 `rewrites` 설정에서 `/api/templates` 경로를 예외 처리했습니다.
- **[수정]** `next.config.js`:
  ```javascript
  // 현재 설정 (Mocking용)
  source: '/api/:path((?!templates).*)',
  
  // ▼ 원복 필요 (실제 백엔드 연동 시)
  source: '/api/:path*',
  ```

---

## ℹ️ UI/UX 변경 사항 리뷰
다음 변경 사항들이 기획 의도와 맞는지 최종 확인해 주세요.

1.  **채점 구간 설정 모달**:
    - 전체 화면(Full Screen)으로 변경됨.
    - 우측 사이드바 접기/펴기 기능 추가.
    - 이미지가 화면 너비에 꽉 차게(Fit Width) 표시됨.
2.  **채점 프로세스**:
    - 채점 완료 시 모달 내부에서 즉시 **CSV 다운로드 버튼**이 노출됨.
3.  **텍스트/라벨**:
    - "학년도" → "**년도**"로 일괄 변경 (2025학년도 → 2025년도).
    - 선택 가능한 년도가 **2027년도**까지 확장됨.
    - 선택 가능한 월이 **1~12월** 전체로 확장됨.

---

## 🧪 테스트 방법
현재 코드는 로컬 환경에서 백엔드 없이도 UI 흐름을 테스트할 수 있도록 설정되어 있습니다.
1. `npm run dev` 실행.
2. 우측 상단 "로그인" 클릭 → "개발자 로그인 (Bypass)" 클릭.
3. "채점 업로드" 메뉴 이동.
4. 파일 업로드 (아무 PDF나 선택, 내부적으로는 `mock_paper.png`가 사용됨).
5. "채점 구간 설정" → "채점 시작" 테스트.
