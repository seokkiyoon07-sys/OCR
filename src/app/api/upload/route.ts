import { NextResponse } from 'next/server';

export async function POST() {
    // Mock response for file upload
    return NextResponse.json({
        session_id: 'mock-session-12345',
        preview_url: '/mock_paper.png',
        filename: '2025년도 11월 서프 수학 답안지.PDF',
    });
}
