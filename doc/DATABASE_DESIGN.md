# SNar OCR 채점기 데이터베이스 설계

## 1. 개요

SNar OCR 채점기 시스템을 위한 데이터베이스 스키마 설계 문서입니다.
수능/모의고사 및 일반시험 채점, 학생 관리, 성적 분석 기능을 지원합니다.

---

## 2. ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Academy   │       │   Student   │       │    Class    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │   ┌──►│ id (PK)     │
│ name        │   │   │ name        │   │   │ name        │
│ created_at  │   │   │ phone       │   │   │ academy_id  │
│ updated_at  │   └───│ academy_id  │   │   │ created_at  │
└─────────────┘       │ class_id    │───┘   └─────────────┘
                      │ parent_phone│
                      │ created_at  │
                      │ updated_at  │
                      └──────┬──────┘
                             │
                             │
┌─────────────┐              │         ┌─────────────────┐
│StudentSubject│◄────────────┘         │      Exam       │
├─────────────┤                        ├─────────────────┤
│ id (PK)     │                        │ id (PK)         │
│ student_id  │                        │ name            │
│ korean      │                        │ exam_type       │
│ math        │                        │ subject         │
│ inquiry1    │                        │ date            │
│ inquiry2    │                        │ total_questions │
└─────────────┘                        │ created_at      │
                                       │ updated_at      │
                                       └────────┬────────┘
                                                │
            ┌───────────────────────────────────┼───────────────────────────────────┐
            │                                   │                                   │
            ▼                                   ▼                                   ▼
┌───────────────────┐              ┌───────────────────┐              ┌───────────────────┐
│  ExamQuestion     │              │   GradeCutoff     │              │   StudentExam     │
├───────────────────┤              ├───────────────────┤              ├───────────────────┤
│ id (PK)           │              │ id (PK)           │              │ id (PK)           │
│ exam_id (FK)      │              │ exam_id (FK)      │              │ exam_id (FK)      │
│ question_number   │              │ grade             │              │ student_id (FK)   │
│ correct_answer    │              │ min_score         │              │ raw_score         │
│ points            │              │ standard_score    │              │ standard_score    │
│ topic (optional)  │              └───────────────────┘              │ grade             │
└───────────────────┘                                                 │ percentile        │
                                                                      │ created_at        │
                                                                      └─────────┬─────────┘
                                                                                │
                                                                                ▼
                                                                    ┌───────────────────┐
                                                                    │  StudentAnswer    │
                                                                    ├───────────────────┤
                                                                    │ id (PK)           │
                                                                    │ student_exam_id   │
                                                                    │ question_number   │
                                                                    │ student_answer    │
                                                                    │ is_correct        │
                                                                    └───────────────────┘
```

---

## 3. 테이블 상세 설계

### 3.1 Academy (학원)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 학원 고유 ID |
| name | VARCHAR(100) | NOT NULL, UNIQUE | 학원명 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

```sql
CREATE TABLE academy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2 Class (반)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 반 고유 ID |
| name | VARCHAR(50) | NOT NULL | 반 이름 |
| academy_id | UUID | FK → Academy | 소속 학원 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

```sql
CREATE TABLE class (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    academy_id UUID NOT NULL REFERENCES academy(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(academy_id, name)
);
```

---

### 3.3 Student (학생)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 학생 고유 ID |
| name | VARCHAR(50) | NOT NULL | 학생 이름 |
| phone | VARCHAR(20) | | 학생 전화번호 |
| parent_phone | VARCHAR(20) | | 학부모 전화번호 |
| academy_id | UUID | FK → Academy | 소속 학원 |
| class_id | UUID | FK → Class | 소속 반 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

```sql
CREATE TABLE student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    academy_id UUID NOT NULL REFERENCES academy(id) ON DELETE CASCADE,
    class_id UUID REFERENCES class(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_student_academy ON student(academy_id);
CREATE INDEX idx_student_class ON student(class_id);
```

---

### 3.4 StudentSubject (학생 선택과목)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| student_id | UUID | FK → Student, UNIQUE | 학생 ID |
| korean | VARCHAR(20) | | 국어 선택 (언어와매체/화법과작문) |
| math | VARCHAR(20) | | 수학 선택 (확률과통계/미적분/기하) |
| inquiry1 | VARCHAR(20) | | 탐구1 선택과목 |
| inquiry2 | VARCHAR(20) | | 탐구2 선택과목 |

**선택과목 ENUM 값:**
- 국어: `언어와매체`, `화법과작문`
- 수학: `확률과통계`, `미적분`, `기하`
- 탐구(사회): `생활과윤리`, `윤리와사상`, `한국지리`, `세계지리`, `동아시아사`, `세계사`, `경제`, `정치와법`, `사회문화`
- 탐구(과학): `물리학Ⅰ`, `물리학Ⅱ`, `화학Ⅰ`, `화학Ⅱ`, `생명과학Ⅰ`, `생명과학Ⅱ`, `지구과학Ⅰ`, `지구과학Ⅱ`

```sql
CREATE TABLE student_subject (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES student(id) ON DELETE CASCADE,
    korean VARCHAR(20),
    math VARCHAR(20),
    inquiry1 VARCHAR(20),
    inquiry2 VARCHAR(20)
);
```

---

### 3.5 Exam (시험)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 시험 고유 ID |
| name | VARCHAR(100) | NOT NULL | 시험명 |
| exam_type | ENUM | NOT NULL | 시험 유형 (모의고사/일반시험) |
| subject | VARCHAR(20) | NOT NULL | 과목 |
| date | DATE | NOT NULL | 시험일 |
| total_questions | INTEGER | NOT NULL | 총 문항 수 |
| round | INTEGER | | 회차 (일반시험용) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

```sql
CREATE TYPE exam_type AS ENUM ('모의고사', '일반시험');

CREATE TABLE exam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    exam_type exam_type NOT NULL,
    subject VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    total_questions INTEGER NOT NULL,
    round INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exam_date ON exam(date);
CREATE INDEX idx_exam_type ON exam(exam_type);
CREATE INDEX idx_exam_subject ON exam(subject);
```

---

### 3.6 ExamQuestion (시험 문제)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| exam_id | UUID | FK → Exam | 시험 ID |
| question_number | INTEGER | NOT NULL | 문제 번호 |
| correct_answer | VARCHAR(10) | NOT NULL | 정답 (1~5 또는 단답형) |
| points | INTEGER | NOT NULL, DEFAULT 2 | 배점 |
| topic | VARCHAR(50) | | 출제 영역/유형 |

```sql
CREATE TABLE exam_question (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exam(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    correct_answer VARCHAR(10) NOT NULL,
    points INTEGER NOT NULL DEFAULT 2,
    topic VARCHAR(50),
    UNIQUE(exam_id, question_number)
);

CREATE INDEX idx_exam_question_exam ON exam_question(exam_id);
```

---

### 3.7 GradeCutoff (등급컷)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| exam_id | UUID | FK → Exam | 시험 ID |
| grade | INTEGER | NOT NULL, 1-9 | 등급 |
| min_score | INTEGER | NOT NULL | 최소 원점수 |
| standard_score | INTEGER | | 표준점수 |

```sql
CREATE TABLE grade_cutoff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exam(id) ON DELETE CASCADE,
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 9),
    min_score INTEGER NOT NULL,
    standard_score INTEGER,
    UNIQUE(exam_id, grade)
);

CREATE INDEX idx_grade_cutoff_exam ON grade_cutoff(exam_id);
```

---

### 3.8 StudentExam (학생별 시험 결과)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| student_id | UUID | FK → Student | 학생 ID |
| exam_id | UUID | FK → Exam | 시험 ID |
| raw_score | INTEGER | | 원점수 |
| standard_score | INTEGER | | 표준점수 |
| grade | INTEGER | | 등급 (1-9) |
| percentile | DECIMAL(5,2) | | 백분위 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |

```sql
CREATE TABLE student_exam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exam(id) ON DELETE CASCADE,
    raw_score INTEGER,
    standard_score INTEGER,
    grade INTEGER CHECK (grade >= 1 AND grade <= 9),
    percentile DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, exam_id)
);

CREATE INDEX idx_student_exam_student ON student_exam(student_id);
CREATE INDEX idx_student_exam_exam ON student_exam(exam_id);
```

---

### 3.9 StudentAnswer (학생 답안)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 ID |
| student_exam_id | UUID | FK → StudentExam | 학생시험 ID |
| question_number | INTEGER | NOT NULL | 문제 번호 |
| student_answer | VARCHAR(10) | | 학생 답안 |
| is_correct | BOOLEAN | NOT NULL | 정답 여부 |

```sql
CREATE TABLE student_answer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_exam_id UUID NOT NULL REFERENCES student_exam(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    student_answer VARCHAR(10),
    is_correct BOOLEAN NOT NULL,
    UNIQUE(student_exam_id, question_number)
);

CREATE INDEX idx_student_answer_exam ON student_answer(student_exam_id);
CREATE INDEX idx_student_answer_incorrect ON student_answer(student_exam_id) WHERE is_correct = FALSE;
```

---

## 4. 주요 쿼리 예시

### 4.1 학생별 성적 추이 조회 (일반시험)

```sql
SELECT
    e.name AS exam_name,
    e.round,
    e.date,
    se.raw_score,
    se.grade
FROM student_exam se
JOIN exam e ON se.exam_id = e.id
WHERE se.student_id = :student_id
  AND e.exam_type = '일반시험'
  AND e.subject = :subject
ORDER BY e.round ASC;
```

### 4.2 학생별 오답 목록 조회

```sql
SELECT
    e.name AS exam_name,
    e.round,
    sa.question_number,
    sa.student_answer,
    eq.correct_answer,
    eq.topic
FROM student_answer sa
JOIN student_exam se ON sa.student_exam_id = se.id
JOIN exam e ON se.exam_id = e.id
JOIN exam_question eq ON eq.exam_id = e.id AND eq.question_number = sa.question_number
WHERE se.student_id = :student_id
  AND sa.is_correct = FALSE
  AND e.subject = :subject
ORDER BY e.date DESC, sa.question_number ASC;
```

### 4.3 반복 오답 문제 조회 (2회 이상 틀린 문제)

```sql
SELECT
    sa.question_number,
    COUNT(*) AS wrong_count,
    ARRAY_AGG(e.name) AS exam_names
FROM student_answer sa
JOIN student_exam se ON sa.student_exam_id = se.id
JOIN exam e ON se.exam_id = e.id
WHERE se.student_id = :student_id
  AND sa.is_correct = FALSE
  AND e.subject = :subject
GROUP BY sa.question_number
HAVING COUNT(*) >= 2
ORDER BY wrong_count DESC;
```

### 4.4 월별 시험 목록 조회

```sql
SELECT
    id,
    name,
    exam_type,
    subject,
    date,
    total_questions
FROM exam
WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', :target_date::DATE)
ORDER BY date DESC;
```

### 4.5 학원별 시험 결과 통계

```sql
SELECT
    e.name AS exam_name,
    e.subject,
    COUNT(se.id) AS total_students,
    AVG(se.raw_score) AS avg_score,
    MAX(se.raw_score) AS max_score,
    MIN(se.raw_score) AS min_score,
    AVG(se.grade) AS avg_grade
FROM student_exam se
JOIN student s ON se.student_id = s.id
JOIN exam e ON se.exam_id = e.id
WHERE s.academy_id = :academy_id
  AND e.id = :exam_id
GROUP BY e.id, e.name, e.subject;
```

---

## 5. 인덱스 전략

### 5.1 주요 인덱스

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| student | academy_id | 학원별 학생 조회 |
| student | class_id | 반별 학생 조회 |
| exam | date | 날짜별 시험 조회 |
| exam | (exam_type, subject) | 유형/과목별 필터링 |
| student_exam | student_id | 학생별 성적 조회 |
| student_exam | exam_id | 시험별 결과 조회 |
| student_answer | student_exam_id | 답안 조회 |
| student_answer | (student_exam_id) WHERE is_correct = FALSE | 오답 조회 |

### 5.2 복합 인덱스

```sql
-- 학생별 과목별 성적 조회 최적화
CREATE INDEX idx_student_exam_student_subject ON student_exam(student_id, exam_id);

-- 시험 목록 필터링 최적화
CREATE INDEX idx_exam_type_subject_date ON exam(exam_type, subject, date);
```

---

## 6. 데이터 마이그레이션

### 6.1 초기 데이터

```sql
-- 기본 학원 생성
INSERT INTO academy (name) VALUES ('SN독학기숙학원');

-- 기본 반 생성
INSERT INTO class (name, academy_id)
SELECT '1반', id FROM academy WHERE name = 'SN독학기숙학원'
UNION ALL
SELECT '2반', id FROM academy WHERE name = 'SN독학기숙학원';
```

---

## 7. 보안 고려사항

1. **전화번호 암호화**: 학생/학부모 전화번호는 민감정보이므로 암호화 저장 권장
2. **Row Level Security**: 학원별 데이터 접근 제한 필요
3. **API 인증**: 모든 API 엔드포인트에 인증 필수

```sql
-- RLS 정책 예시 (Supabase/PostgreSQL)
ALTER TABLE student ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy can view own students"
ON student FOR SELECT
USING (academy_id = auth.jwt() ->> 'academy_id');
```

---

## 8. 확장 고려사항

### 8.1 AI 코멘트 테이블 (추후 구현)

```sql
CREATE TABLE ai_comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_exam_id UUID NOT NULL REFERENCES student_exam(id) ON DELETE CASCADE,
    weakness TEXT,
    reasons JSONB,
    improvements JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 8.2 OCR 처리 이력 테이블

```sql
CREATE TABLE ocr_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_exam_id UUID REFERENCES student_exam(id),
    image_url TEXT NOT NULL,
    ocr_result JSONB,
    confidence DECIMAL(5,4),
    processed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. API 엔드포인트 매핑

| 기능 | HTTP Method | Endpoint | 관련 테이블 |
|------|-------------|----------|------------|
| 학생 목록 조회 | GET | /api/students | student, student_subject |
| 학생 추가 | POST | /api/students | student, student_subject |
| 학생 수정 | PUT | /api/students/:id | student, student_subject |
| 학생 삭제 | DELETE | /api/students/:id | student |
| 시험 목록 조회 | GET | /api/exams | exam |
| 시험 추가 | POST | /api/exams | exam, exam_question, grade_cutoff |
| 시험 수정 | PUT | /api/exams/:id | exam, exam_question, grade_cutoff |
| 시험 삭제 | DELETE | /api/exams/:id | exam |
| 성적 조회 | GET | /api/results/:studentId | student_exam, student_answer |
| 채점 결과 저장 | POST | /api/grading | student_exam, student_answer |
| 월별 시험 조회 | GET | /api/exams?month=2024-12 | exam |

---

## 10. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-12-19 | 초기 설계 문서 작성 |
