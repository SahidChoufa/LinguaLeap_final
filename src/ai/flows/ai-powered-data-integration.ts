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
  prompt: `You are an expert translator and document processor. Your task is to:

1. Analyze the provided PDF text that contains names and numbers
2. Look at the template text with its placeholders
3. Translate the content to {{targetLanguage}} while preserving names and numbers
4. Map the translated content into the template structure

PDF Content to translate:
{{pdfText}}

Template to populate (maintain its structure):
{{templateText}}

Target Language: {{targetLanguage}}

Rules:
- Preserve all names exactly as they appear
- Keep numbers unchanged
- Maintain document formatting
- Ensure natural, fluent translation
- Keep placeholder positions intact

Return the final translated and populated content that matches the template structure.`,
});

const aiPoweredDataIntegrationFlow = ai.defineFlow(
  {
    name: 'aiPoweredDataIntegrationFlow',
    inputSchema: DataIntegrationInputSchema,
    outputSchema: DataIntegrationOutputSchema,
  },
  async input => {
    const result = await dataIntegrationPrompt(input);
    if (!result.output) {
      throw new Error('Failed to generate translation');
    }
    return result.output;
  }
);