import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    // Mock layout data
    const mockLayout = {
        dpi: 300,
        blocks: [
            {
                type: 'digits',
                name: '수험번호',
                quad: [[100, 100], [400, 100], [400, 200], [100, 200]],
                cols: 8,
                rows: 10
            },
            {
                type: 'grid',
                name: '1-5번',
                quad: [[100, 300], [400, 300], [400, 800], [100, 800]],
                cols: 5,
                rows: 5,
                choices: ['1', '2', '3', '4', '5']
            }
        ]
    };

    return NextResponse.json(mockLayout);
}
