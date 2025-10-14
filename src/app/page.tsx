'use client';

import SNarOCRLayout from '@/components/SNarOCRLayout';
import { useSNarOCRNavigation } from '@/hooks/useSNarOCRNavigation';

export default function SNarOCRLanding() {
  const { navigateTo } = useSNarOCRNavigation();

  const handleGoto = (page: string) => {
    navigateTo(page);
  };

  return (
    <SNarOCRLayout currentPage="landing">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">수능 특화 OCR 채점기</h2>
                <p className="text-sm text-blue-600 font-medium mt-1">Powered by SN독학기숙학원</p>
              </div>
              <div className="p-6 space-y-3 text-sm text-neutral-600">
                <p>문제지를 찍거나 PDF를 업로드하면 즉시 인식하고 자동 채점합니다. 틀린 문제는 하이라이트로 표시되며, 유형별 오답 통계를 제공합니다.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-neutral-100 p-3">
                    <div className="text-2xl font-semibold">97.8%</div>
                    <div className="text-xs text-neutral-500">OCR 정확도(내부테스트)</div>
                  </div>
                  <div className="rounded-xl bg-neutral-100 p-3">
                    <div className="text-2xl font-semibold">&lt;1s</div>
                    <div className="text-xs text-neutral-500">평균 문항 인식 시간</div>
                  </div>
                  <div className="rounded-xl bg-neutral-100 p-3">
                    <div className="text-2xl font-semibold">46+</div>
                    <div className="text-xs text-neutral-500">문항 세트 동시 처리</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    className="px-4 py-2 rounded-xl bg-black text-white"
                    onClick={() => handleGoto('upload')}
                  >
                    지금 체험하기
                  </button>
                  <button className="px-4 py-2 rounded-xl border">데모 보기</button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">주요 기능</h2>
              </div>
              <div className="p-6 text-sm text-neutral-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>스냅샷/스캔 이미지/PDF 업로드</li>
                  <li>자동 정답 매칭 & 점수 산출</li>
                  <li>오답노트 자동 생성</li>
                  <li>유형별/단원별 취약점 분석</li>
                  <li>학원 관리자용 대시보드</li>
                  <li>CSV/PDF 내보내기</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">데이터 보호 & 보안</h2>
            </div>
            <div className="p-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">최소 수집 원칙</div>
                <p className="text-xs text-neutral-600">채점에 필요한 데이터만 수집하여 분석에 활용합니다.</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">암호화 저장</div>
                <p className="text-xs text-neutral-600">식별 정보와 점수 데이터는 별도 저장 및 암호화합니다.</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">동의 기반 분석</div>
                <p className="text-xs text-neutral-600">개인정보 및 통계 활용은 이용자 동의를 전제로 합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SNarOCRLayout>
  );
}