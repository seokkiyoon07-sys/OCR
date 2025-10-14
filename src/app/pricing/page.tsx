'use client';

import SNarOCRLayout from '@/components/SNarOCRLayout';

export default function SNarOCRPricing() {
  return (
    <SNarOCRLayout currentPage="pricing">
      <section className="space-y-6">
        <div className="space-y-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold">요금제</h2>
            <p className="text-sm text-neutral-600">MVP 단계에서는 무료 체험 위주로 운영</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Free</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-3xl font-semibold">₩0</div>
                <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                  <li>월 100채점</li>
                  <li>기본 분석</li>
                  <li>오답노트</li>
                </ul>
                <button className="w-full px-4 py-2 rounded-xl bg-black text-white">시작하기</button>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Academy</h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-3xl font-semibold">개당 100원</div>
                <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                  <li>반/학년 대시보드</li>
                  <li>SSO/초대코드</li>
                  <li>API 연동</li>
                </ul>
                <button className="w-full px-4 py-2 rounded-xl bg-black text-white">문의하기</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">자주 묻는 질문</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-b pb-4">
                <div className="font-medium mb-2">무료 체험은 얼마나 사용할 수 있나요?</div>
                <div className="text-sm text-neutral-600">월 100회까지 무료로 채점 서비스를 이용하실 수 있습니다.</div>
              </div>
              <div className="border-b pb-4">
                <div className="font-medium mb-2">결제는 어떻게 하나요?</div>
                <div className="text-sm text-neutral-600">신용카드, 계좌이체, 간편결제 등 다양한 방법을 지원합니다.</div>
              </div>
              <div className="border-b pb-4">
                <div className="font-medium mb-2">학원용 요금제는 어떻게 신청하나요?</div>
                <div className="text-sm text-neutral-600">학원 규모와 사용량에 따라 맞춤형 요금제를 제공합니다. 문의해주세요.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SNarOCRLayout>
  );
}
