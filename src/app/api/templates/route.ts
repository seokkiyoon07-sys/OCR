import { NextResponse } from 'next/server';

export async function GET() {
    // Mock template list
    return NextResponse.json([
        '2025학년도_수능_국어.json',
        '2025학년도_수능_수학.json',
        '2025학년도_수능_영어.json',
        '공통_OMR_양식.json'
    ]);
}
