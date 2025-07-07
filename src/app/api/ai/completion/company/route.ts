export const runtime = "edge";
export const maxDuration = 60;

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { BUSINESS_SECTORS } from "@/lib/constants/business-sectors";
import { COUNTRIES } from "@/lib/constants/countries";
import { LANGUAGES } from "@/lib/constants/languages";
import { firecrawl } from "@/lib/firecrawl";

const CompanyCompletionSchema = z.object({
  companyName: z.string().nullable().describe("The name of the company"),
  businessSector: z
    .string()
    .nullable()
    .describe("The business sector of the company. Return the code."),
  country: z
    .string()
    .nullable()
    .describe("The country of the company. Return the code."),
  description: z.string().nullable().describe("The description of the company"),
  language: z
    .string()
    .nullable()
    .describe("The language of the company. Return the code."),
});

export type CompanyCompletion = z.infer<typeof CompanyCompletionSchema>;

export async function POST(request: Request) {
  try {
    const { companyWebsiteUrl } = await request.json();

    if (!companyWebsiteUrl) {
      return Response.json(
        { success: false, error: "Company website url is required" },
        { status: 400 },
      );
    }

    let rawUrl = companyWebsiteUrl;

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

    const crawl = await firecrawl.scrapeUrl(url);

    let content: string | undefined;
    if (crawl.success) {
      if (crawl.markdown) {
        content = crawl.markdown;
      } else {
        content = crawl.html;
      }
    }

    if (!content) {
      return Response.json(
        {
          success: false,
          error: crawl.error ? crawl.error : "Failed to crawl company website",
        },
        { status: 400 },
      );
    }

    console.log(content);

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: CompanyCompletionSchema,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates a company profile for a given company website.
          You will be given the company website url and it's content.
          You will need to generate a company profile for it.
          If you can't find the information, return null.
          These are the options for the business sector: ${BUSINESS_SECTORS.map((sector) => `${sector.name} (${sector.code})`).join(", ")}. Return the code.
          These are the options for the country: ${COUNTRIES.map((country) => `${country.name} (${country.code})`).join(", ")}. Return the code.
          These are the options for the language: ${LANGUAGES.map((language) => `${language.name} (${language.code})`).join(", ")}. Return the code.
          If the business sector is not in the list, return null.
          If the country is not in the list, return null.
          If the language is not in the list, return null.
          `,
        },
        {
          role: "user",
          content: `Generate a company profile for ${companyWebsiteUrl} with the following content: ${content}`,
        },
      ],
      temperature: 0.5,
    });

    return Response.json({
      success: true,
      data: object,
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
