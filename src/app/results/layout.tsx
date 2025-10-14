import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '채점 결과',
  description: '채점 결과를 확인하고 오답노트를 통해 학습 효과를 극대화하세요.',
  keywords: ['채점 결과', '오답노트', '학습 분석', '성적 분석'],
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
