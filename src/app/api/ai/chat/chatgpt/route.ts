import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { CHATGPT_PROMPT } from "@/prompts/chagpt";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return Response.json(
        { success: false, error: "Prompt is required" },
        { status: 400 },
      );
    }

    const result = streamText({
      model: openai.responses("gpt-4.1"),
      tools: {
        web_search_preview: openai.tools.webSearchPreview({}),
      },
      messages: [
        {
          role: "system",
          content: CHATGPT_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      toolChoice: {
        type: "tool",
        toolName: "web_search_preview",
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
