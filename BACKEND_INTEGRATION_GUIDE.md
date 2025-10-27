# SNAR OCR 백엔드 통합 가이드라인

이 문서는 SNAR OCR 프로젝트에 백엔드를 통합하기 위한 가이드라인입니다. 백엔드 개발자가 프론트엔드 코드를 이해하고 필요한 API를 구현할 수 있도록 작성되었습니다.

## 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [주요 페이지 및 기능](#주요-페이지-및-기능)
3. [필요한 API 엔드포인트](#필요한-api-엔드포인트)
4. [데이터 모델](#데이터-모델)
5. [파일 업로드 처리](#파일-업로드-처리)
6. [OCR 처리](#ocr-처리)
7. [채점 프로세스](#채점-프로세스)
8. [데이터베이스 스키마 제안](#데이터베이스-스키마-제안)

---

## 프로젝트 구조

### 주요 디렉토리
```
src/
├── app/
│   ├── upload/          # 시험지 업로드 및 채점 설정
│   ├── results/          # 채점 결과 조회 (학원별)
│   └── individual-results/ # 개인별 채점 결과
├── components/           # 공통 컴포넌트
├── hooks/                # 커스텀 훅
└── lib/                  # 유틸리티 함수
```

---

## 주요 페이지 및 기능

### 1. `/upload` - 시험지 업로드 및 채점 설정

**경로**: `src/app/upload/page.tsx`

**주요 기능**:
- 시험지 파일 업로드 (PDF, PNG 등)
- 시험 정보 입력 (시험지명, 과목, 학년 등)
- 정답 및 배점 입력
- 채점 구간(블록) 설정
- 성적표 정보 입력 (표준점수, 백분위, 등급)

**상태 관리**:
- `selectedSubject`: 선택된 과목
- `selectedExam`: 선택된 시험
- `answers`: 정답 배열
- `scores`: 배점 배열
- `blocks`: 채점 구간 블록 목록
- `gradeInfo`: 성적표 정보 (원점수별 표준점수, 백분위, 등급)

**과목 분류**:
- **국어**: 45문항 (객관식)
- **수학**: 30문항 (객관식 1-28, 주관식 29-30)
- **영어**: 45문항 (객관식)
- **탐구**:
  - 사회탐구: 20문항 (9개 과목 중 선택)
  - 과학탐구: 20문항 (8개 과목 중 선택)
  - 한국사: 20문항

### 2. `/results` - 채점 결과 조회 (학원별)

**경로**: `src/app/results/page.tsx`

**주요 기능**:
- 채점 날짜 및 시험지 선택
- 과목별 채점 결과 조회
- 반별 점수 분석 (통계, 분포)
- 오답률 분석
- CSV 다운로드

**필요한 데이터**:
- 채점 완료된 시험 목록
- 과목별 채점 통계
- 문항별 오답률
- 반별 점수 통계 (평균, 표준편차, 최고점, 최저점)

### 3. `/individual-results` - 개인별 채점 결과

**경로**: `src/app/individual-results/page.tsx`

**주요 기능**:
- 학생 개인별 성적표
- 과목별 상세 분석
- 최근 채점한 시험지 목록
- 오답노트

**필요한 데이터**:
- 학생 개인 정보
- 과목별 점수 (원점수, 표준점수, 백분위, 등급)
- 오답한 문항 목록
- 과목별 오답 상세 정보

---

## 필요한 API 엔드포인트

### 1. 시험지 업로드 및 처리

#### `POST /api/exams/upload`
시험지 파일 업로드 및 저장

**Request**:
```json
{
  "file": "multipart/form-data",
  "examName": "string",
  "subject": "string",
  "grade": "string",
  "examOrganization": "string"
}
```

**Response**:
```json
{
  "examId": "string",
  "fileName": "string",
  "fileUrl": "string",
  "totalPages": "number"
}
```

#### `POST /api/exams/answers`
정답 및 배점 저장

**Request**:
```json
{
  "examId": "string",
  "subject": "string",
  "answers": ["string"],
  "scores": ["number"],
  "gradeInfo": [
    {
      "score": "number",
      "standardScore": "string",
      "percentile": "number",
      "grade": "number",
      "testTakers": "number"
    }
  ]
}
```

**Response**:
```json
{
  "examId": "string",
  "status": "saved"
}
```

#### `POST /api/exams/grading-zones`
채점 구간(블록) 설정

**Request**:
```json
{
  "examId": "string",
  "blocks": [
    {
      "id": "string",
      "type": "text" | "name" | "id" | "code",
      "choices": "number",
      "rows": "number",
      "dataFormat": "grid" | "digits" | "id" | "phone" | "name" | "code"
    }
  ]
}
```

### 2. 채점 처리

#### `POST /api/grading/start`
채점 시작

**Request**:
```json
{
  "examId": "string",
  "blocks": ["array of block objects"]
}
```

**Response**:
```json
{
  "gradingId": "string",
  "status": "processing"
}
```

#### `GET /api/grading/{gradingId}/status`
채점 진행 상태 확인

**Response**:
```json
{
  "gradingId": "string",
  "status": "completed" | "processing" | "failed",
  "progress": "number",
  "totalPages": "number",
  "processedPages": "number"
}
```

#### `GET /api/grading/{gradingId}/results`
채점 결과 조회

**Response**:
```json
{
  "gradingId": "string",
  "examId": "string",
  "examName": "string",
  "gradingDate": "string",
  "gradedCount": "number",
  "subjects": ["array of subject results"]
}
```

### 3. 결과 조회

#### `GET /api/exams`
시험 목록 조회

**Query Parameters**:
- `startDate` (optional)
- `endDate` (optional)

**Response**:
```json
{
  "exams": [
    {
      "examId": "string",
      "examName": "string",
      "subject": "string",
      "gradingDate": "string",
      "gradedCount": "number"
    }
  ]
}
```

#### `GET /api/exams/{examId}/results`
시험별 채점 결과 조회

**Query Parameters**:
- `subject` (optional): 과목 필터
- `class` (optional): 반 필터

**Response**:
```json
{
  "examId": "string",
  "examName": "string",
  "subject": "string",
  "gradedCount": "number",
  "statistics": {
    "average": "number",
    "standardDeviation": "number",
    "maxScore": "number",
    "minScore": "number"
  },
  "scoreDistribution": [
    {
      "scoreRange": "string",
      "studentCount": "number",
      "percentage": "number"
    }
  ],
  "wrongAnswerStats": [
    {
      "question": "number",
      "wrongCount": "number",
      "percentage": "number",
      "topStudentWrongCount": "number",
      "topStudentPercentage": "number"
    }
  ]
}
```

#### `GET /api/exams/{examId}/individual-results`
개인별 채점 결과 조회

**Query Parameters**:
- `studentId` (required): 학생 ID

**Response**:
```json
{
  "studentId": "string",
  "studentName": "string",
  "class": "string",
  "exam": {
    "examId": "string",
    "examName": "string",
    "gradingDate": "string"
  },
  "subjects": [
    {
      "subject": "string",
      "rawScore": "number",
      "standardScore": "number",
      "percentile": "number",
      "grade": "number",
      "wrongQuestions": ["number"],
      "wrongDetails": [
        {
          "question": "number",
          "type": "string",
          "detail": "string"
        }
      ]
    }
  ]
}
```

### 4. CSV 다운로드

#### `GET /api/exams/{examId}/results/csv`
채점 결과 CSV 다운로드

**Query Parameters**:
- `subject` (optional): 과목 필터

**Response**: CSV 파일 (UTF-8 BOM)

**Format**:
```
수험번호,이름,소속반,과목코드,총점,만점,총문제수,정답수,오답번호
STU_강동호,강동호,1반,국어,81,100,45,37,"11,12,13"
```

#### `GET /api/exams/{examId}/wrong-answers/csv`
문항별 오답률 CSV 다운로드

**Query Parameters**:
- `subject` (optional): 과목 필터

**Response**: CSV 파일 (UTF-8 BOM)

**Format**:
```
문항,오답수,전체인원,오답률(%),상위권오답수,상위권오답률(%)
1,5,28,17.9,1,3.6
...
```

---

## 데이터 모델

### Exam (시험)
```typescript
interface Exam {
  examId: string;
  examName: string;
  subject: string;
  grade?: string;
  examOrganization?: string;
  fileName: string;
  fileUrl: string;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
}
```

### Answer (정답)
```typescript
interface Answer {
  examId: string;
  answers: string[];
  scores: number[];
  gradeInfo: GradeInfo[];
}
```

### GradeInfo (성적표 정보)
```typescript
interface GradeInfo {
  score: number;
  standardScore: string;
  percentile: number;
  grade: number;
  testTakers: number;
}
```

### Grading (채점)
```typescript
interface Grading {
  gradingId: string;
  examId: string;
  blocks: Block[];
  status: "completed" | "processing" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
}
```

### Block (채점 구간)
```typescript
interface Block {
  id: string;
  type: "text" | "name" | "id" | "code";
  choices: number;
  rows: number;
  dataFormat: "grid" | "digits" | "id" | "phone" | "name" | "code";
}
```

### GradingResult (채점 결과)
```typescript
interface GradingResult {
  gradingId: string;
  examId: string;
  examName: string;
  gradingDate: string;
  gradedCount: number;
  subjects: SubjectResult[];
}
```

### SubjectResult (과목별 결과)
```typescript
interface SubjectResult {
  subject: string;
  statistics: {
    average: number;
    standardDeviation: number;
    maxScore: number;
    minScore: number;
  };
  scoreDistribution: {
    scoreRange: string;
    studentCount: number;
    percentage: number;
  }[];
  wrongAnswerStats: {
    question: number;
    wrongCount: number;
    percentage: number;
    topStudentWrongCount: number;
    topStudentPercentage: number;
  }[];
}
```

### StudentResult (학생별 결과)
```typescript
interface StudentResult {
  studentId: string;
  studentName: string;
  studentCode: string;
  class: string;
  subjects: {
    subject: string;
    rawScore: number;
    standardScore: number;
    percentile: number;
    grade: number;
    wrongQuestions: number[];
  }[];
}
```

---

## 파일 업로드 처리

### 권장 사항

1. **파일 저장**:
   - 클라우드 스토리지 사용 권장 (AWS S3, Azure Blob, Google Cloud Storage)
   - 로컬 저장 시: `uploads/exams/{examId}/` 경로에 저장
   - 파일명: `{examId}_{timestamp}.{extension}`

2. **파일 크기 제한**:
   - PDF: 최대 50MB
   - 이미지: 최대 10MB per file

3. **지원 형식**:
   - PDF
   - 이미지 (PNG, JPG, JPEG)

4. **비동기 처리**:
   - 대용량 파일 업로드 시 비동기 처리 필요
   - 업로드 상태 확인을 위한 엔드포인트 제공

---

## OCR 처리

### 권장 서비스

1. **Google Cloud Vision API**
2. **AWS Textract**
3. **Azure Computer Vision**
4. **Open Source**: Tesseract OCR

### OCR 처리 단계

1. **파일 변환**: PDF를 이미지로 변환
2. **이미지 전처리**: 
   - 이미지 향상 (밝기, 대비 조정)
   - 노이즈 제거
   - 회전 보정
3. **영역 인식**: 블록 설정에 따른 영역 자동 인식
4. **텍스트 추출**: OCR로 텍스트 추출
5. **데이터 검증**: 입력값 검증 및 오류 처리

### 예상 처리 시간

- 1페이지: 약 3-5초
- 10페이지: 약 30-50초
- 100페이지: 약 5-8분

---

## 채점 프로세스

### 1. 시험지 업로드 및 설정
```
사용자 → 파일 업로드 → 정답 입력 → 배점 입력 → 채점 구간 설정
```

### 2. 블록 설정
```
이름 블록: 학생 이름 추출
학번 블록: 학생 ID 추출
과목번호 블록: 과목 식별
배점 블록: 점수 추출
```

### 3. 채점 실행
```
OCR 처리 → 데이터 추출 → 채점 로직 실행 → 결과 저장
```

### 4. 결과 조회
```
학원별 조회 → 통계 계산 → 과목별 분석
개인별 조회 → 성적표 생성 → 오답노트 생성
```

---

## 데이터베이스 스키마 제안

### ERD 추천
```
Exams (시험)
├── exam_id (PK)
├── exam_name
├── subject
├── grade
├── exam_organization
├── file_url
└── total_pages

Answers (정답)
├── answer_id (PK)
├── exam_id (FK → Exams)
├── subject
├── answers (JSON)
├── scores (JSON)
└── grade_info (JSON)

Grades (채점)
├── grade_id (PK)
├── exam_id (FK → Exams)
├── grading_date
└── graded_count

Grade_Results (채점 결과)
├── result_id (PK)
├── grade_id (FK → Grades)
├── student_id
├── student_name
├── student_code
├── class
└── total_score

Subject_Results (과목별 결과)
├── subject_result_id (PK)
├── result_id (FK → Grade_Results)
├── subject
├── raw_score
├── standard_score
├── percentile
├── grade
└── wrong_questions (JSON)

Blocks (채점 구간)
├── block_id (PK)
├── exam_id (FK → Exams)
├── block_name
├── block_type
├── choices
├── rows
└── data_format
```

### 주요 인덱스
```sql
-- Exams 테이블
CREATE INDEX idx_exams_subject ON Exams(subject);
CREATE INDEX idx_exams_grading_date ON Exams(grading_date);

-- Grade_Results 테이블
CREATE INDEX idx_results_student_id ON Grade_Results(student_id);
CREATE INDEX idx_results_grade_id ON Grade_Results(grade_id);

-- Subject_Results 테이블
CREATE INDEX idx_subject_results_subject ON Subject_Results(subject);
```

---

## 기술 스택 제안

### 백엔드 프레임워크
- **Node.js + Express** (추천)
- **Python + FastAPI**
- **Java + Spring Boot**
- **Go + Gin**

### 데이터베이스
- **PostgreSQL** (추천)
- **MySQL**
- **MongoDB** (NoSQL 옵션)

### 파일 저장소
- **AWS S3** (추천)
- **Azure Blob Storage**
- **Google Cloud Storage**

### OCR 서비스
- **Google Cloud Vision API** (추천)
- **AWS Textract**
- **Tesseract OCR** (오픈소스)

### 캐싱
- **Redis** (대규모 조회 성능 향상)

---

## 보안 고려사항

1. **파일 업로드 검증**
   - 파일 형식 검증
   - 파일 크기 제한
   - 악성 파일 검사

2. **인증/인가**
   - JWT 토큰 기반 인증
   - 역할 기반 접근 제어 (RBAC)

3. **데이터 보호**
   - 개인정보 암호화 (이름, 학번 등)
   - HTTPS 통신

4. **속도 제한**
   - API 호출 제한 (Rate Limiting)
   - DDoS 방어

---

## 성능 최적화

### 1. 대량 파일 처리
- 배치 처리
- 워커 프로세스 분리
- 처리 상태 실시간 업데이트

### 2. 조회 최적화
- 인덱싱
- Redis 캐싱
- 페이지네이션

### 3. 파일 저장
- CDN 활용
- 썸네일 생성
- 압축 저장

---

## 테스트 가이드

### 1. 단위 테스트
- 각 API 엔드포인트 단위 테스트
- 채점 로직 테스트

### 2. 통합 테스트
- 전체 채점 프로세스 테스트
- 파일 업로드 → 채점 → 결과 조회 플로우 테스트

### 3. 성능 테스트
- 대용량 파일 처리
- 동시 사용자 테스트

---

## 배포 가이드

### 환경 변수
```env
DATABASE_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
OCR_API_KEY=
JWT_SECRET=
```

### Docker 사용 권장
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 추가 기능 제안

### 1. 실시간 채점 진행률
- WebSocket을 통한 실시간 업데이트

### 2. 배치 채점
- 여러 시험지를 한 번에 채점

### 3. 차트 라이브러리
- Chart.js 또는 Recharts 사용

### 4. 알림 기능
- 채점 완료 시 알림

---

## 문의 및 지원

백엔드 개발 중 문의사항은 프론트엔드 개발팀에 문의하세요.

**프론트엔드 담당**: [프론트엔드 개발자]
**이메일**: [email]
**슬랙**: [채널 이름]

---

_이 문서는 2025-01-20 기준으로 작성되었습니다._

