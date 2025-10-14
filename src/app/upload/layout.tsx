import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '채점 업로드',
  description: '이미지나 PDF를 업로드하여 수능/모의고사 답안지를 자동으로 채점하세요.',
  keywords: ['채점 업로드', 'OCR 업로드', '수능 채점', '모의고사 채점'],
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
