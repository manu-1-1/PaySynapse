import { NextResponse } from 'next/server';
import { investigateException } from '@/lib/ai/investigate';

export async function POST(request) {
  try {
    const { exceptionId } = await request.json();

    if (!exceptionId) {
      return NextResponse.json({ error: 'exceptionId is required' }, { status: 400 });
    }

    const result = await investigateException(exceptionId);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API /api/ai/investigate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
