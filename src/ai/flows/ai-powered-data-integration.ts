import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataIntegrationInputSchema = z.object({
  pdfText: z
    .string()
    .describe('The extracted text content from the PDF document containing names and numbers.'),
  templateText: z
    .string()
    .describe('The text content from the Word document template containing placeholders.'),
  targetLanguage: z.string().describe('The target language of the Word document template.'),
});
export type DataIntegrationInput = z.infer<typeof DataIntegrationInputSchema>;

const DataIntegrationOutputSchema = z.object({
  translatedContent: z
    .string()
    .describe('The translated and populated content, ready to be inserted into a Word document.'),
});
export type DataIntegrationOutput = z.infer<typeof DataIntegrationOutputSchema>;

export async function aiPoweredDataIntegration(input: DataIntegrationInput): Promise<DataIntegrationOutput> {
  return aiPoweredDataIntegrationFlow(input);
}

const dataIntegrationPrompt = ai.definePrompt({
  name: 'dataIntegrationPrompt',
  input: {schema: DataIntegrationInputSchema},
  output: {schema: DataIntegrationOutputSchema},
  prompt: `You are an AI assistant that intelligently translates and populates document content.

  Your task is to:
  1. Analyze the extracted text from the PDF containing names and numbers
  2. Identify the placeholders in the template text
  3. Translate and map the extracted data to the correct placeholders
  4. Ensure the output is coherent and grammatically correct in the target language

  PDF Content:
  {{pdfText}}

  Template Content:
  {{templateText}}

  Target Language: {{targetLanguage}}

  Translate and populate the template with the extracted data, ensuring proper formatting and language adaptation.
  Return only the final translated and populated content.`,
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