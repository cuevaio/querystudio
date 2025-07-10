import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { decodeUnicodeEscapes } from "@/lib/utils";
import { GENERATE_TOPICS_AND_QUERIES_PROMPT } from "@/prompts/generate-suggested-topics";
import { RecommendedTopicsSchema } from "@/schemas/recommended-topics";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { websiteUrl, name, country, language, sector, description } = body;

    console.log("body", body);

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
      model: openai.responses("gpt-4o"),
      messages: [
        {
          role: "system",
          content: GENERATE_TOPICS_AND_QUERIES_PROMPT,
        },
        {
          role: "user",
          content: `Generate topics and queries for the following company:
          
          Name: ${name}
          Website: ${url}
          Country: ${country}
          Language: ${language}
          Sector: ${sector}
          Description: ${description}
          `,
        },
      ],
      temperature: 0.7,
      toolChoice: {
        type: "tool",
        toolName: "web_search_preview",
      },
      experimental_output: Output.object({
        schema: RecommendedTopicsSchema,
      }),
    });

    // Create a custom transform stream to decode unicode escapes
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const decodedChunk = decodeUnicodeEscapes(chunk);
            controller.enqueue(new TextEncoder().encode(decodedChunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
