'use server';
/**
 * @fileOverview An AI agent for summarizing library visitor trends.
 *
 * - adminTrendSummary - A function that handles the generation of visitor trend summaries.
 * - AdminTrendSummaryInput - The input type for the adminTrendSummary function.
 * - AdminTrendSummaryOutput - The return type for the adminTrendSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisitLogSchema = z.object({
  timestamp: z.string().datetime().describe('Timestamp of the visit in ISO 8601 format.'),
  purposeOfVisit: z
    .string()
    .describe('The purpose of the visit (e.g., Study, Research, Borrowing).'),
  college: z.string().describe('The college/department of the visitor.'),
});

const AdminTrendSummaryInputSchema = z.object({
  visitLogs: z.array(VisitLogSchema).describe('An array of visitor logs for analysis.'),
});
export type AdminTrendSummaryInput = z.infer<typeof AdminTrendSummaryInputSchema>;

const AdminTrendSummaryOutputSchema = z.object({
  summary: z.string().describe('An AI-generated summary of visitor trends.'),
});
export type AdminTrendSummaryOutput = z.infer<typeof AdminTrendSummaryOutputSchema>;

export async function adminTrendSummary(
  input: AdminTrendSummaryInput
): Promise<AdminTrendSummaryOutput> {
  return adminTrendSummaryFlow(input);
}

const adminTrendSummaryPrompt = ai.definePrompt({
  name: 'adminTrendSummaryPrompt',
  input: {schema: AdminTrendSummaryInputSchema},
  output: {schema: AdminTrendSummaryOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing library visitor data.
  Your task is to analyze the provided visitor logs and generate a concise summary of key trends and insights.
  Focus on identifying:
  - Peak usage times (e.g., busiest hours of the day, days of the week).
  - Most popular visit purposes.
  - College-specific trends (e.g., which colleges use the library most, their common purposes).
  - Any other notable patterns or anomalies.

  The summary should be actionable and help library administrators make informed operational decisions.
  Present the information clearly and concisely, directly as a JSON object with a single 'summary' field.

  Visitor Logs:
  {{{JSON.stringify visitLogs}}}`,
});

const adminTrendSummaryFlow = ai.defineFlow(
  {
    name: 'adminTrendSummaryFlow',
    inputSchema: AdminTrendSummaryInputSchema,
    outputSchema: AdminTrendSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await adminTrendSummaryPrompt(input);
    return output!;
  }
);
