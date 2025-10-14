'use client';

import SNarOCRLayout from '@/components/SNarOCRLayout';

export default function SNarOCRFAQ() {
  return (
    <SNarOCRLayout currentPage="faq">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">FAQ & 고객센터</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">자주 묻는 질문</h3>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer font-medium">사진이 흐릴 때도 인식되나요?</summary>
                  <p className="mt-2 text-neutral-600">가능하나 정확도는 낮아질 수 있습니다. 광량 확보를 권장합니다.</p>
                </details>
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer font-medium">서술형도 채점되나요?</summary>
                  <p className="mt-2 text-neutral-600">서술형은 OCR+규칙 기반 제안 후 수동 검토 단계를 제공합니다.</p>
                </details>
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer font-medium">개인정보는 안전한가요?</summary>
                  <p className="mt-2 text-neutral-600">최소 수집 원칙 및 암호화 저장을 적용합니다.</p>
                </details>
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer font-medium">어떤 파일 형식을 지원하나요?</summary>
                  <p className="mt-2 text-neutral-600">JPG, PNG 이미지와 PDF 파일을 지원합니다.</p>
                </details>
                <details className="rounded-xl border p-3">
                  <summary className="cursor-pointer font-medium">채점 결과는 언제까지 보관되나요?</summary>
                  <p className="mt-2 text-neutral-600">무료 계정은 30일, 유료 계정은 1년간 보관됩니다.</p>
                </details>
              </div>
            </div>

            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">문의하기</h3>
              </div>
              <div className="p-6 space-y-3">
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="이메일"
                  type="email"
                />
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="제목"
                  type="text"
                />
                <textarea
                  className="w-full rounded-xl border px-3 py-2 h-32 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="문의 내용을 적어주세요"
                ></textarea>
                <button className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800">전송</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">서비스 현황</h3>
            </div>
            <div className="p-6">
              <div className="text-sm font-semibold mb-2">v0.3.0 릴리즈</div>
              <div className="text-xs text-neutral-600 space-y-1">
                <div>- 서술형 검토 워크플로우 베타</div>
                <div>- 성능 최적화 및 안정성 개선</div>
                <div>- 새로운 과목 지원 추가</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SNarOCRLayout>
  );
}
