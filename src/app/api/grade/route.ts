import { NextRequest, NextResponse } from 'next/server';

// Increase timeout to 10 minutes for grading operations
export const maxDuration = 600; // 10 minutes in seconds

const API_BASE = process.env.API_PROXY_TARGET || 
                 process.env.NEXT_PUBLIC_API_ORIGIN || 
                 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
    
    const response = await fetch(`${API_BASE}/api/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: '채점 작업이 타임아웃되었습니다. (10분 초과)' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
