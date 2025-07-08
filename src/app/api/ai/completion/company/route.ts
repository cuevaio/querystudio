export const runtime = "edge";
export const maxDuration = 60;

import { openai } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { BUSINESS_SECTORS } from "@/lib/constants/business-sectors";
import { CompanySchema } from "@/schemas/company";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);

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
        web_search_preview: openai.tools.webSearchPreview(),
      },
      model: openai.responses("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates a company profile for a given company website url.
          You will need to generate a company profile for it. Use the web search tool to find the information.
          The output format should be XML like this:
          {
            "name": "Company Name",
            "country": "Country",
            "language": "Language",
            "sector": "Business Sector",
            "description": "Company Description",
            "website": "Company Website",
          }

          The available business sectors are: ${BUSINESS_SECTORS.map((sector) => sector.code).join(", ")}. Return the sector code as provided in the list. If the sector is not in the list, return null.

           For the description, talk about what the company does, who it serves, and what it's mission is. Products and services it specializes in. And who are their clients.
           Return all the information in English.

          If you can't find information, return null for the missing fields:
          {
            "name": "Company Name",
            "country": null,
            "language": "Language",
            "sector": null,
            "description": "Company Description", 
            "website": "Company Website"
            
          }
          
          Just return the XML, no other text.
          This is critical. RETURN THE XML ONLY.`,
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
          content: `Generate a company profile for ${url}`,
        },
      ],
      temperature: 0.7,
      maxSteps: 10,
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
