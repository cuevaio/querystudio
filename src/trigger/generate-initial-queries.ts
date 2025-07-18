import { openai } from "@ai-sdk/openai";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, projects, type QueryInsert, queries, topics } from "@/db";
import { decodeUnicodeEscapes } from "@/lib/utils";
import { GENERATE_TOPIC_QUERIES_PROMPT } from "@/prompts/generate-topic-queries";
import { AIGeneratedQuerySchema } from "@/schemas/ai-generated-query";

export const generateInitialQueries = schemaTask({
  id: "generate-initial-queries",
  schema: z.object({
    organizationId: z.string(),
  }),
  run: async (payload) => {
    const { organizationId } = payload;

    const org = await db.query.projects.findFirst({
      where: eq(projects.id, organizationId),
      with: {
        topics: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    // After creating initial topics and queries, generate additional queries for each topic
    const batchHandle = await generateQueriesForTopic.batchTrigger(
      org.topics.map((topicData) => ({
        payload: {
          organizationId,
          topicId: topicData.id,
        },
      })),
    );

    return {
      batchHandle: batchHandle,
      additionalQueriesGenerated: org.topics.length,
    };
  },
  handleError: async (_payload, error) => {
    if (error instanceof Error && error.message === "Organization not found") {
      return {
        skipRetrying: true,
      };
    }
  },
});

export const generateQueriesForTopic = schemaTask({
  id: "generate-queries-for-topic",
  schema: z.object({
    topicId: z.string(),
  }),
  run: async (payload) => {
    const { topicId } = payload;

    // Get the topic with its organization and existing queries
    const topicData = await db.query.topics.findFirst({
      where: eq(topics.id, topicId),
      with: {
        project: true,
        queries: true,
      },
    });

    if (!topicData) {
      throw new Error("Topic not found");
    }

    if (!topicData.project) {
      throw new Error("Project not found");
    }

    const projectId = topicData.project.id;

    const existingQueries = topicData.queries.map((q) => q.text);

    const { text } = await generateText({
      tools: {
        web_search_preview: openai.tools.webSearchPreview({}),
      },
      model: openai.responses("gpt-4.1"),
      messages: [
        {
          role: "system",
          content: GENERATE_TOPIC_QUERIES_PROMPT,
        },
        {
          role: "user",
          content: `Generate 10 additional queries for the following topic and company:

          Company Details:
          Name: ${topicData.project.name}
          Website: ${topicData.project.url}
          Country: ${topicData.project.region}
          Language: ${topicData.project.language}
          Sector: ${topicData.project.sector}
          Description: ${topicData.project?.description}
          
          Topic Details:
          Name: ${topicData.name}
          Description: ${topicData.description}
          
          Existing Queries (DO NOT DUPLICATE):
          ${existingQueries.map((q, i) => `${i + 1}. ${q}`).join("\n")}
          
          Please generate 10 new, unique queries that complement but don't duplicate the existing ones.
          `,
        },
      ],
      temperature: 0.7,
      toolChoice: {
        type: "tool",
        toolName: "web_search_preview",
      },
      experimental_output: Output.object({
        schema: z.object({
          queries: z.array(AIGeneratedQuerySchema),
        }),
      }),
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    logger.info("raw", { text });
    console.log("raw", text);

    // Decode the entire JSON text BEFORE parsing
    const decodedText = decodeUnicodeEscapes(text);
    logger.info("decoded text", { decodedText });
    console.log("decoded text", decodedText);

    // Now parse the decoded JSON
    const parsedData = JSON.parse(decodedText);
    const data = parsedData.queries as z.infer<typeof AIGeneratedQuerySchema>[];

    logger.info("final data", { data });
    console.log("final data", data);

    // Insert the new queries into the database
    await db.insert(queries).values(
      data.map(
        (queryData) =>
          ({
            topicId,
            projectId,
            country: topicData.project?.region,
            text: queryData.text,
            queryType: queryData.queryType,
            active: true,
          }) satisfies QueryInsert,
      ),
    );

    return {
      topicId,
      topicName: topicData.name,
      queriesGenerated: data.length,
      queries: data,
    };
  },
  handleError: async (_payload, error) => {
    if (error instanceof Error && error.message === "Topic not found") {
      return {
        skipRetrying: true,
      };
    }
  },
});
