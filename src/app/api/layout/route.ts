import { NextResponse } from 'next/server';

export async function POST() {
    // Mock response for layout save
    return NextResponse.json({
        ok: true,
        message: 'Layout saved successfully (Mock)',
    });
}
