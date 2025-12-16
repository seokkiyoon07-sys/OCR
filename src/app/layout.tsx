import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SNar OCR - 수능 특화 OCR 채점기 | SN독학기숙학원",
    template: "%s | SNar OCR"
  },
  description: "SN독학기숙학원의 수능/모의고사 답안지를 OCR로 자동 채점하는 AI 서비스. 97.8% 정확도로 빠르고 정확한 채점을 제공합니다.",
  keywords: ["수능", "모의고사", "OCR", "자동채점", "AI", "교육", "학습", "채점기"],
  authors: [{ name: "SN독학기숙학원" }],
  creator: "SN독학기숙학원",
  publisher: "SN독학기숙학원",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://snar-ocr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://snar-ocr.com',
    title: 'SNar OCR - 수능 특화 OCR 채점기 | SN독학기숙학원',
    description: 'SN독학기숙학원의 수능/모의고사 답안지를 OCR로 자동 채점하는 AI 서비스',
    siteName: 'SNar OCR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SNar OCR - 수능 특화 OCR 채점기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SNar OCR - 수능 특화 OCR 채점기 | SN독학기숙학원',
    description: 'SN독학기숙학원의 수능/모의고사 답안지를 OCR로 자동 채점하는 AI 서비스',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
