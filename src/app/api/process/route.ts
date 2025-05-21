import { aiPoweredDataIntegration } from '@/ai/flows/ai-powered-data-integration';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { pdfText, templateText, targetLanguage } = data;

    const result = await aiPoweredDataIntegration({
      pdfText,
      templateText,
      targetLanguage,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}