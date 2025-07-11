"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  projects,
  projectsUsers,
  type QueryInsert,
  queries,
  topics,
} from "@/db/schema";
import { nanoid } from "@/lib/nanoid";
import { AIGeneratedQuerySchema } from "@/schemas/ai-generated-query";
import type { generateInitialQueries } from "@/trigger/generate-initial-queries";

export type CreateProjectActionState = {
  input: {
    name: string;
    websiteUrl: string;
    sector: string;
    country: string;
    language: string;
    description: string;
    topics: string;
  };
  output:
    | {
        success: true;
        data: {
          slug: string;
          run: { id: string; publicAccessToken: string };
        };
      }
    | { success: false; error?: string };
};

export async function createProject(
  _prev: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const raw = {
    name: formData.get("name"),
    websiteUrl: formData.get("websiteUrl")?.toString().startsWith("http")
      ? formData.get("websiteUrl")?.toString()
      : `https://${formData.get("websiteUrl")?.toString()}`,
    sector: formData.get("sector"),
    country: formData.get("country"),
    language: formData.get("language"),
    description: formData.get("description"),
    topics: JSON.parse(formData.get("topics")?.toString() || "[]"),
  };

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    websiteUrl: z.string().url("Valid website URL is required"),
    sector: z.string().min(1, "Sector is required"),
    country: z.string().min(1, "Country is required"),
    language: z.string().min(1, "Language is required"),
    description: z.string().min(1, "Description is required"),
    topics: z.array(
      z.object({
        name: z.string().min(1, "Topic name is required"),
        description: z.string().min(1, "Topic description is required"),
        queries: z.array(AIGeneratedQuerySchema),
      }),
    ),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateProjectActionState = {
    input: raw as CreateProjectActionState["input"],
    output: { success: false },
  };

  if (!parsed.success) {
    state.output = {
      success: false,
      error: formatZodErrors(parsed.error.errors),
    };
    return state;
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      state.output = {
        success: false,
        error: "You must be authenticated to create a project",
      };
      return state;
    }

    const userId = session.user.id;

    let slug = slugify(parsed.data.name);

    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
    });

    if (existingProject) {
      slug = `${slug}-${nanoid(4)}`;
    }

    // Create project and get the auto-generated ID
    const [insertedProject] = await db
      .insert(projects)
      .values({
        name: parsed.data.name,
        slug,
        url: parsed.data.websiteUrl,
        sector: parsed.data.sector,
        region: parsed.data.country,
        language: parsed.data.language,
        description: parsed.data.description,
        userId,
      })
      .returning({ id: projects.id });

    const projectId = insertedProject.id;

    await db.insert(projectsUsers).values({
      projectId,
      userId,
      role: "admin",
    });

    const topicsData = parsed.data.topics.map((topicItem) => {
      return {
        name: topicItem.name,
        description: topicItem.description,
        projectId,
        queries: topicItem.queries.map((queryItem) => ({
          text: queryItem.query,
          queryType: queryItem.companySpecific ? "product" : "sector",
          projectId,
        })),
      };
    });

    console.log(topicsData);

    // Insert topics and get their auto-generated IDs
    const insertedTopics = await db
      .insert(topics)
      .values(
        topicsData.map((topicItem) => ({
          name: topicItem.name,
          description: topicItem.description,
          projectId,
        })),
      )
      .returning({ id: topics.id, name: topics.name });

    // Create queries with the actual topic IDs
    const queriesData = [];
    for (let i = 0; i < topicsData.length; i++) {
      const topicItem = topicsData[i];
      const insertedTopic = insertedTopics[i];

      for (const queryItem of topicItem.queries) {
        queriesData.push({
          text: queryItem.text,
          queryType: queryItem.queryType as "sector" | "product",
          topicId: insertedTopic.id,
          projectId,
        } satisfies QueryInsert);
      }
    }

    await db.insert(queries).values(queriesData);

    const run = await tasks.trigger<typeof generateInitialQueries>(
      "generate-initial-queries",
      {
        organizationId: projectId, // Use the auto-generated projectId
      },
    );

    state.output = {
      success: true,
      data: {
        slug,
        run: {
          id: run.id,
          publicAccessToken: run.publicAccessToken,
        },
      },
    };
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      if (err.message.includes("slug")) {
        state.output = {
          success: false,
          error: "A project with this slug already exists",
        };
      }
    } else {
      state.output = {
        success: false,
        error: "Failed to create project",
      };
    }
  }

  return state;
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatZodErrors(errors: z.ZodError["errors"]) {
  return errors
    .map((error) => `${error.path.join(".")}: ${error.message}`)
    .join("\n");
}
