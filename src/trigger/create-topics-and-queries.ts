import { openai } from "@ai-sdk/openai";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { generateText, Output } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, organization, query, type TopicInsert, topic } from "@/db";
import { nanoid } from "@/lib/nanoid";
import { GENERATE_TOPICS_AND_QUERIES_PROMPT } from "@/prompts/generate-topics-and-queries";

const TopicSchema = z.object({
  topic: z.string(),
  description: z.string(),
  queries: z.array(z.string()),
});

export const createTopicsAndQueries = schemaTask({
  id: "create-topics-and-queries",
  schema: z.object({
    organizationId: z.string(),
  }),
  run: async (payload) => {
    const { organizationId } = payload;

    const org = await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    const { text } = await generateText({
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
      },
      model: openai.responses("gpt-4.1"),
      messages: [
        {
          role: "system",
          content: GENERATE_TOPICS_AND_QUERIES_PROMPT,
        },
        {
          role: "user",
          content: `Generate topics and queries for the following company:
          
          Name: ${org.name}
          Website: ${org.websiteUrl}
          Country: ${org.country}
          Language: ${org.language}
          Sector: ${org.sector}
          Description: ${org.description}
          `,
        },
      ],
      temperature: 0.7,
      maxSteps: 10,
      toolChoice: {
        type: "tool",
        toolName: "web_search_preview",
      },
      experimental_output: Output.object({
        schema: z.object({
          topics: z.array(TopicSchema),
        }),
      }),
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    const data = JSON.parse(text).topics as z.infer<typeof TopicSchema>[];

    const topics = data.map(
      (topic) =>
        ({
          id: nanoid(),
          organizationId,
          name: topic.topic,
          description: topic.description,
        }) satisfies TopicInsert,
    );
    await db.insert(topic).values(topics);

    await db.insert(query).values(
      data.flatMap((topic) =>
        topic.queries.map((query) => ({
          id: nanoid(),
          organizationId,
          // biome-ignore lint/style/noNonNullAssertion: we know the topic exists
          topicId: topics.find((t) => t.name === topic.topic)!.id,
          content: query,
        })),
      ),
    );

    return {
      data: JSON.parse(text),
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
