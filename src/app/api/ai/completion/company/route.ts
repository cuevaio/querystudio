import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { COMPANY_PROMPT } from "@/prompts/company";
import { CompanySchema } from "@/schemas/company";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { websiteUrl } = body;

    if (!websiteUrl) {
      return Response.json(
        { success: false, error: "Company website url is required" },
        { status: 400 },
      );
    }

    let rawUrl = websiteUrl;

    if (!rawUrl.startsWith("http")) {
      rawUrl = `https://${rawUrl}`;
    }

    const urlParsing = z.string().url().safeParse(rawUrl);

    if (!urlParsing.success) {
      return Response.json(
        { success: false, error: "Invalid company website url" },
        { status: 400 },
      );
    }
    const url = urlParsing.data;

    const result = streamText({
      tools: {
        web_search_preview: openai.tools.webSearchPreview({}),
      },
      model: openai.responses("gpt-4.1"),
      messages: [
        {
          role: "system",
          content: COMPANY_PROMPT,
        },
        {
          role: "user",
          content: `Generate a company profile for acme.com`,
        },
        {
          role: "assistant",
          content: `{
            "name": "Acme",
            "country": "United States",
            "language": "English",
            "sector": "Manufacturing",
            "description": "Acme is a company that makes widgets.",
            "website": "https://acme.com"
          }`,
        },
        {
          role: "user",
          content: `Perfect! Now generate a company profile for ${url}`,
        },
      ],
      temperature: 0.7,
      toolChoice: {
        type: "tool",
        toolName: "web_search_preview",
      },
      experimental_output: Output.object({
        schema: CompanySchema,
      }),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
