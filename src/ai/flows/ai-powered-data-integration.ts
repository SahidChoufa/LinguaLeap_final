// The AI Powered Data Integration flow uses AI to map extracted data from a PDF to a Word document template in another language.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataIntegrationInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>' containing the extracted data (names and numbers) from the PDF."
    ),
  templateDataUri: z
    .string()
    .describe(
      "A Word document template as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This template contains placeholders to be populated with the extracted data."
    ),
  targetLanguage: z.string().describe('The target language of the Word document template.'),
});
export type DataIntegrationInput = z.infer<typeof DataIntegrationInputSchema>;

const DataIntegrationOutputSchema = z.object({
  populatedDocumentDataUri: z
    .string()
    .describe(
      'The populated Word document as a data URI, with the extracted data inserted into the correct placeholders. Must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type DataIntegrationOutput = z.infer<typeof DataIntegrationOutputSchema>;

export async function aiPoweredDataIntegration(input: DataIntegrationInput): Promise<DataIntegrationOutput> {
  return aiPoweredDataIntegrationFlow(input);
}

const dataIntegrationPrompt = ai.definePrompt({
  name: 'dataIntegrationPrompt',
  input: {schema: DataIntegrationInputSchema},
  output: {schema: DataIntegrationOutputSchema},
  prompt: `You are an AI assistant that intelligently populates a Word document template with data extracted from a PDF.

  The Word document template may be in a different language than the extracted data. Your task is to accurately map the extracted data (names and numbers) to the correct placeholders in the template, ensuring that the populated document is coherent and grammatically correct in the target language.

  Here is the extracted data from the PDF:
  {{media url=pdfDataUri}}

  Here is the Word document template in {{targetLanguage}}:
  {{media url=templateDataUri}}

  Populate the Word document template with the extracted data, matching the data to the correct placeholders. Return the populated document as a data URI.
  Ensure that all names and numbers are correctly placed and formatted.
  The populated document must be a valid data URI.

  Output the populated document as a data URI with base64 encoding.
  `,
});

const aiPoweredDataIntegrationFlow = ai.defineFlow(
  {
    name: 'aiPoweredDataIntegrationFlow',
    inputSchema: DataIntegrationInputSchema,
    outputSchema: DataIntegrationOutputSchema,
  },
  async input => {
    const {output} = await dataIntegrationPrompt(input);
    return output!;
  }
);
