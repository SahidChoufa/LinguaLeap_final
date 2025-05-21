import { aiPoweredDataIntegration } from '@/ai/flows/ai-powered-data-integration';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { pdfText, templateText, targetLanguage } = data;

    // Store the original texts in Supabase for history
    const { error: insertError } = await supabase
      .from('translations')
      .insert({
        pdf_text: pdfText,
        template_text: templateText,
        target_language: targetLanguage,
        status: 'processing'
      });

    if (insertError) {
      console.error('Error storing translation:', insertError);
    }

    const result = await aiPoweredDataIntegration({
      pdfText,
      templateText,
      targetLanguage,
    });

    // Update the translation record with the result
    if (!insertError) {
      const { error: updateError } = await supabase
        .from('translations')
        .update({
          translated_content: result.translatedContent,
          status: 'completed'
        })
        .eq('pdf_text', pdfText)
        .eq('template_text', templateText);

      if (updateError) {
        console.error('Error updating translation:', updateError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}