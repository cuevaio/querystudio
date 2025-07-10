import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { CLAUDE_PROMPT } from "@/prompts/claude";

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
      model: anthropic("claude-3-5-sonnet-latest"),
      tools: {
        web_search: anthropic.tools.webSearch_20250305({}),
      },
      messages: [
        {
          role: "system",
          content: CLAUDE_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      toolChoice: {
        type: "tool",
        toolName: "web_search",
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Claude API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
