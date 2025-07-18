import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { GENERATE_SINGLE_QUERY_PROMPT } from "@/prompts/generate-single-query";
import { AIGeneratedQuerySchema } from "@/schemas/ai-generated-query";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      companyName,
      topicName,
      topicDescription,
      existingQueries,
      companyDescription,
    } = body;

    if (!companyName || !topicName) {
      return Response.json(
        { success: false, error: "Company name and topic name are required" },
        { status: 400 },
      );
    }

    // Format existing queries for context
    const existingQueriesText =
      existingQueries && existingQueries.length > 0
        ? `\n\nExisting queries to avoid duplicating:\n${existingQueries.map((q: any, i: number) => `${i + 1}. ${q.text} (${q.queryType})`).join("\n")}`
        : "\n\nNo existing queries yet.";

    const contextMessage = `Company: ${companyName}
Topic: ${topicName}
Topic Description: ${topicDescription || "No description provided"}
Company Description: ${companyDescription || "No company description provided"}${existingQueriesText}

Generate 1 unique, customer-focused query for this topic that would be valuable for market research and doesn't duplicate any existing queries.`;

    const result = streamText({
      model: openai.responses("gpt-4.1"),
      messages: [
        {
          role: "system",
          content: GENERATE_SINGLE_QUERY_PROMPT,
        },
        {
          role: "user",
          content: `Company: Acme Bank
Topic: Mobile Banking
Topic Description: Features and functionality of mobile banking applications
Company Description: Acme Bank is a digital-first bank offering mobile banking solutions.

Existing queries to avoid duplicating:
1. How do I transfer money using mobile banking? (sector)
2. What security features does Acme Bank's mobile app have? (product)

Generate 1 unique, customer-focused query for this topic that would be valuable for market research and doesn't duplicate any existing queries.`,
        },
        {
          role: "assistant",
          content: `{
            "text": "Which mobile banking apps allow international wire transfers without visiting a branch?",
            "queryType": "sector"
          }`,
        },
        {
          role: "user",
          content: contextMessage,
        },
      ],
      temperature: 0.8,
      experimental_output: Output.object({
        schema: AIGeneratedQuerySchema,
      }),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
