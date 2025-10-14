import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '요금제',
  description: 'Free와 Academy 요금제로 선택하세요. 월 100채점 무료 또는 개당 100원으로 이용하세요.',
  keywords: ['요금제', '가격', '무료', '유료', '채점 서비스'],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
