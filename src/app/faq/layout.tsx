import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'SNar OCR 서비스에 대한 자주 묻는 질문과 답변을 확인하세요.',
  keywords: ['FAQ', '자주 묻는 질문', '문의', '고객센터', '도움말'],
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
