import { NextRequest, NextResponse } from 'next/server';

// Increase timeout to 10 minutes for grading operations
export const maxDuration = 600; // 10 minutes in seconds

const API_BASE = process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  // MOCK: Return fake grading results directly
  return NextResponse.json({
    log: '채점 시작...\n1번 문항: 정답 (배점 2.0)\n2번 문항: 오답 (배점 3.0) - 마킹 오류 감지\n...\n총점: 84점\n채점 완료.',
    csv_url: '#',
    json_url: '#',
    zip_url: '#',
    message: 'Mock grading completed successfully',
  });
}
