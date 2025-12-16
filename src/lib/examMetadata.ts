'use client';

export interface SubjectSelection {
  subject: string;
  subjectCategory: string;
  socialCategory: string;
  scienceCategory: string;
  historyCategory: string;
}

export interface DerivedSubjectInfo {
  subjectName: string;
  subjectCode: string;
  paperLabel: string;
}

const SUBJECT_CODE_LOOKUP: Record<string, string> = {
  '국어': '1000',
  '화법과 작문': '1001',
  '언어와 매체': '1002',
  '수학': '2000',
  '확률과 통계': '2001',
  '미적분': '2002',
  '기하': '2003',
  '영어': '3000',
  '한국사': '4000',
  '생활과 윤리': '4111',
  '윤리와 사상': '4112',
  '한국지리': '4113',
  '세계지리': '4114',
  '동아시아사': '4115',
  '세계사': '4116',
  '경제': '4117',
  '정치와 법': '4118',
  '사회·문화': '4119',
  '물리학I': '4220',
  '화학I': '4221',
  '생명과학I': '4222',
  '지구과학I': '4223',
  '물리학II': '4224',
  '화학II': '4225',
  '생명과학II': '4226',
  '지구과학II': '4227',
};

const HASH_SEED = 31;

const hashSubject = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * HASH_SEED + value.charCodeAt(i)) >>> 0;
  }
  return `CUST-${hash.toString(36).toUpperCase()}`;
};

export const deriveSubjectInfo = ({
  subject,
  subjectCategory,
  socialCategory,
  scienceCategory,
  historyCategory,
}: SubjectSelection): DerivedSubjectInfo => {
  const baseSubject = subject.trim();
  const hasBaseSelection =
    baseSubject !== '' && baseSubject !== '과목을 선택하세요';

  const resolvedLeafCandidate =
    (subjectCategory === 'social' && socialCategory.trim()) ||
    (subjectCategory === 'science' && scienceCategory.trim()) ||
    (subjectCategory === 'history' && historyCategory.trim()) ||
    baseSubject;

  const subjectName = resolvedLeafCandidate.trim();
  if (!hasBaseSelection || subjectName === '') {
    return { subjectName: '', subjectCode: '', paperLabel: '' };
  }
  if (baseSubject === '탐구' && subjectName === '탐구') {
    return { subjectName: '', subjectCode: '', paperLabel: '' };
  }

  const subjectCode =
    SUBJECT_CODE_LOOKUP[subjectName] ??
    SUBJECT_CODE_LOOKUP[baseSubject] ??
    hashSubject(subjectName);

  const paperLabel =
    baseSubject && baseSubject !== subjectName
      ? `${baseSubject}-${subjectName}`
      : subjectName;

  return {
    subjectName,
    subjectCode,
    paperLabel,
  };
};
