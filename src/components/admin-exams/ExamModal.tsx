'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Exam, ExamQuestion, GradeCutoff } from './types';
import {
  SUBJECT_OPTIONS,
  SOCIAL_STUDIES,
  SCIENCE_STUDIES,
  EXAM_PROVIDERS,
  getSubjectConfig,
  getQuestionPoints,
  DEFAULT_GRADE_CUTOFFS,
  getSubjectCode,
  YEAR_OPTIONS,
  MONTH_OPTIONS,
  type SubjectConfig,
} from '@/lib/examPresets';

// Use /api proxy path
const API_BASE = '/api';

interface ExamModalProps {
  exam: Exam | null;
  onClose: () => void;
  onSave: () => void;
}

export function ExamModal({ exam, onClose, onSave }: ExamModalProps) {
  const [step, setStep] = useState<'basic' | 'questions' | 'grades'>('basic');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Basic info state
  const [examName, setExamName] = useState(exam?.name || '');
  const [examType, setExamType] = useState<'모의고사' | '일반시험'>(exam?.examType || '모의고사');
  const [subject, setSubject] = useState(exam?.subject || '국어');
  const [detailedSubject, setDetailedSubject] = useState('');
  const [examYear, setExamYear] = useState(exam?.examYear?.toString() || String(new Date().getFullYear()));
  const [examMonth, setExamMonth] = useState(exam?.examMonth?.toString() || '1');
  const [provider, setProvider] = useState(exam?.providerName || '');
  const [customProvider, setCustomProvider] = useState('');
  const [gradeLevel, setGradeLevel] = useState(exam?.gradeLevel || '고3');
  
  // Questions state
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [gradeCutoffs, setGradeCutoffs] = useState<GradeCutoff[]>(
    exam?.gradeCutoffs || DEFAULT_GRADE_CUTOFFS.map(c => ({ ...c }))
  );
  
  // Get actual provider name
  const actualProvider = useMemo(() => {
    if (provider === '기타') return customProvider;
    return provider;
  }, [provider, customProvider]);
  
  // Get actual subject name
  const actualSubject = useMemo(() => {
    if (subject === '탐구' && detailedSubject) return detailedSubject;
    return subject;
  }, [subject, detailedSubject]);
  
  // Get subject configuration based on current selection
  const subjectConfig: SubjectConfig = useMemo(() => {
    return getSubjectConfig(actualSubject, actualProvider);
  }, [actualSubject, actualProvider]);
  
  // Generate questions based on subject config
  const generateQuestions = useCallback((config: SubjectConfig, subj: string, prov: string | null): ExamQuestion[] => {
    const count = config.questionCount;
    if (count === 0) return [];
    
    return Array.from({ length: count }, (_, i) => {
      const num = i + 1;
      return {
        questionNumber: num,
        correctAnswer: '',
        points: getQuestionPoints(num, subj, prov),
      };
    });
  }, []);
  
  // Initialize or update questions when subject/provider changes
  useEffect(() => {
    if (exam?.questions && exam.questions.length > 0) {
      setQuestions(exam.questions);
      return;
    }
    
    // Generate default questions based on config
    const newQuestions = generateQuestions(subjectConfig, actualSubject, actualProvider);
    setQuestions(newQuestions);
  }, [actualSubject, actualProvider, subjectConfig, exam?.questions, generateQuestions]);
  
  // Subject-specific options
  const socialStudyOptions = SOCIAL_STUDIES.map(s => ({ value: s, label: s }));
  const scienceStudyOptions = SCIENCE_STUDIES.map(s => ({ value: s, label: s }));
  
  // Update question count manually for '기타' subject
  const handleQuestionCountChange = (count: number) => {
    const newQuestions: ExamQuestion[] = Array.from({ length: count }, (_, i) => ({
      questionNumber: i + 1,
      correctAnswer: '',
      points: 2,
    }));
    setQuestions(newQuestions);
  };
  
  // Update single question
  const updateQuestion = (index: number, field: keyof ExamQuestion, value: string | number) => {
    const newQuestions = [...questions];
    if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value as string;
    } else if (field === 'points') {
      newQuestions[index].points = value as number;
    }
    setQuestions(newQuestions);
  };
  
  // Update grade cutoff
  const updateGradeCutoff = (index: number, field: 'minScore' | 'standardScore', value: number) => {
    const newCutoffs = [...gradeCutoffs];
    newCutoffs[index][field] = value;
    setGradeCutoffs(newCutoffs);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const subjectCode = getSubjectCode(actualSubject);
      const monthStr = examMonth.padStart(2, '0');
      
      // Prepare payload
      const payload = {
        metadata: {
          providerName: actualProvider || examName,
          examYear: parseInt(examYear) || new Date().getFullYear(),
          examMonth: parseInt(examMonth) || 1,
          examCode: exam?.examCode || `${subjectCode}_${examYear}${monthStr}`,
          gradeLevel: gradeLevel,
          subjectCode: subjectCode,
          subjectName: actualSubject,
        },
        questions: questions.map(q => {
          const isSubjective = subjectConfig.subjectiveQuestions?.includes(q.questionNumber);
          const answerNum = parseInt(q.correctAnswer);
          
          return {
            number: q.questionNumber,
            points: q.points,
            correctChoice: !isSubjective && !isNaN(answerNum) ? answerNum : null,
            correctText: isSubjective || isNaN(answerNum) ? q.correctAnswer || null : null,
          };
        }),
      };
      
      const response = await fetch(`${API_BASE}/exams/answer-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `저장 실패: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Saved exam:', result);
      
      onSave();
    } catch (err) {
      console.error('Failed to save exam:', err);
      setSaveError(err instanceof Error ? err.message : '시험 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold">{exam ? '시험 정보 수정' : '시험 추가'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setStep('basic')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            1. 기본 정보
          </button>
          <button
            onClick={() => setStep('questions')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            2. 문제 및 정답
          </button>
          <button
            onClick={() => setStep('grades')}
            className={`flex-1 py-3 text-sm font-medium ${
              step === 'grades' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-neutral-500'
            }`}
          >
            3. 등급컷 및 표준점수
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'basic' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">시험명</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="예: 2025학년도 수능 국어"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">시험 유형</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="모의고사"
                      checked={examType === '모의고사'}
                      onChange={(e) => setExamType(e.target.value as '모의고사' | '일반시험')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-neutral-700">모의고사</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="examType"
                      value="일반시험"
                      checked={examType === '일반시험'}
                      onChange={(e) => setExamType(e.target.value as '모의고사' | '일반시험')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-neutral-700">일반시험</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">과목</label>
                  <Select
                    value={subject}
                    onValueChange={(value) => {
                      setSubject(value);
                      setDetailedSubject('');
                    }}
                    options={SUBJECT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                    placeholder="과목 선택"
                  />
                </div>
                
                {subject === '탐구' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">세부 과목</label>
                    <Select
                      value={detailedSubject}
                      onValueChange={setDetailedSubject}
                      options={[
                        { value: '', label: '선택하세요', disabled: true },
                        { value: '__social__', label: '── 사회탐구 ──', disabled: true },
                        ...socialStudyOptions,
                        { value: '__science__', label: '── 과학탐구 ──', disabled: true },
                        ...scienceStudyOptions,
                      ]}
                      placeholder="세부 과목 선택"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">시행년도</label>
                  <Select
                    value={examYear}
                    onValueChange={setExamYear}
                    options={YEAR_OPTIONS.map(o => ({ value: o.value.replace('년도', ''), label: o.label }))}
                    placeholder="년도 선택"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">시행월</label>
                  <Select
                    value={examMonth}
                    onValueChange={setExamMonth}
                    options={MONTH_OPTIONS.map((o, i) => ({ value: String(i + 1), label: o.label }))}
                    placeholder="월 선택"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">출제기관</label>
                <Select
                  value={provider}
                  onValueChange={setProvider}
                  options={EXAM_PROVIDERS.map(p => ({ value: p.value, label: p.label }))}
                  placeholder="출제기관 선택"
                />
              </div>
              
              {provider === '기타' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">출제기관 입력</label>
                  <input
                    type="text"
                    value={customProvider}
                    onChange={(e) => setCustomProvider(e.target.value)}
                    placeholder="출제기관 이름 입력"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">학년</label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="예: 고3"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {subject === '기타' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">문제 수</label>
                  <input
                    type="number"
                    value={questions.length || ''}
                    onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 0)}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {/* Subject info display */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                <div className="font-medium text-blue-800 mb-1">과목 정보</div>
                <div className="text-blue-700">
                  <span>• 총 문항 수: {subjectConfig.questionCount}문항</span>
                  {subjectConfig.multipleChoice > 0 && (
                    <span> (객관식 {subjectConfig.multipleChoice}문항</span>
                  )}
                  {subjectConfig.subjective > 0 && (
                    <span>, 주관식 {subjectConfig.subjective}문항)</span>
                  )}
                  {subjectConfig.multipleChoice > 0 && subjectConfig.subjective === 0 && <span>)</span>}
                  <br />
                  <span>• 만점: {subjectConfig.maxScore}점</span>
                </div>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-500">
                  각 문제의 정답과 배점을 입력하세요. ({questions.length}문항)
                </p>
                {subjectConfig.subjectiveQuestions && subjectConfig.subjectiveQuestions.length > 0 && (
                  <p className="text-xs text-orange-600">
                    * 주관식: {subjectConfig.subjectiveQuestions.join(', ')}번
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {questions.map((q, idx) => {
                  const isSubjective = subjectConfig.subjectiveQuestions?.includes(q.questionNumber);
                  return (
                    <div 
                      key={q.questionNumber} 
                      className={`flex items-center gap-2 p-3 rounded-lg min-w-0 ${
                        isSubjective ? 'bg-orange-50 border border-orange-200' : 'bg-neutral-50'
                      }`}
                    >
                      <span className={`text-sm font-medium flex-shrink-0 w-10 ${
                        isSubjective ? 'text-orange-600' : 'text-neutral-600'
                      }`}>
                        {q.questionNumber}번
                      </span>
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        placeholder={isSubjective ? '답' : '정답'}
                        className="flex-1 min-w-0 px-2 py-1 text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value) || 0)}
                        min="1"
                        max="10"
                        className="w-12 flex-shrink-0 px-2 py-1 text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-neutral-500 flex-shrink-0">점</span>
                    </div>
                  );
                })}
              </div>
              
              {questions.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  먼저 기본 정보에서 과목을 설정해주세요.
                </div>
              )}
            </div>
          )}

          {step === 'grades' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">각 등급별 원점수 컷과 표준점수를 입력하세요.</p>
              <table className="w-full max-w-lg">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">등급</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">원점수 컷</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">표준점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {gradeCutoffs.map((cutoff, idx) => (
                    <tr key={cutoff.grade}>
                      <td className="px-4 py-2 text-sm font-medium text-neutral-900">{cutoff.grade}등급</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={cutoff.minScore}
                          onChange={(e) => updateGradeCutoff(idx, 'minScore', parseInt(e.target.value) || 0)}
                          min="0"
                          max="100"
                          className="w-20 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={cutoff.standardScore}
                          onChange={(e) => updateGradeCutoff(idx, 'standardScore', parseInt(e.target.value) || 0)}
                          min="0"
                          max="200"
                          className="w-20 px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 p-4 border-t border-neutral-200">
          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {saveError}
            </div>
          )}
          <div className="flex justify-between">
            <button
              onClick={() => {
                if (step === 'questions') setStep('basic');
                else if (step === 'grades') setStep('questions');
              }}
              className={`px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 ${
                step === 'basic' ? 'invisible' : ''
              }`}
            >
              이전
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                취소
              </button>
              {step === 'grades' ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? '저장 중...' : '저장'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step === 'basic') setStep('questions');
                    else if (step === 'questions') setStep('grades');
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다음
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
