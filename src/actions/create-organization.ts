"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { membership, organization } from "@/db/schema";
import { nanoid } from "@/lib/nanoid";
import type { createTopicsAndQueries } from "@/trigger/create-topics-and-queries";

export type CreateOrganizationActionState = {
  input: {
    name: string;
    websiteUrl: string;
    sector: string;
    country: string;
    language: string;
    description: string;
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

export async function createOrganization(
  _prev: CreateOrganizationActionState,
  formData: FormData,
): Promise<CreateOrganizationActionState> {
  const raw = {
    name: formData.get("name"),
    websiteUrl: formData.get("websiteUrl")?.toString().startsWith("http")
      ? formData.get("websiteUrl")?.toString()
      : `https://${formData.get("websiteUrl")?.toString()}`,
    sector: formData.get("sector"),
    country: formData.get("country"),
    language: formData.get("language"),
    description: formData.get("description"),
  };

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    websiteUrl: z.string().url("Valid website URL is required"),
    sector: z.string().min(1, "Sector is required"),
    country: z.string().min(1, "Country is required"),
    language: z.string().min(1, "Language is required"),
    description: z.string().min(1, "Description is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateOrganizationActionState = {
    input: raw as CreateOrganizationActionState["input"],
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
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      state.output = {
        success: false,
        error: "You must be authenticated to create an organization",
      };
      return state;
    }

    const userId = session.user.id;
    const organizationId = nanoid(12);

    // Create organization
    await Promise.all([
      db.insert(organization).values({
        id: organizationId,
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        websiteUrl: parsed.data.websiteUrl,
        sector: parsed.data.sector,
        country: parsed.data.country,
        language: parsed.data.language,
        description: parsed.data.description,
      }),

      db.insert(membership).values({
        organizationId,
        userId,
        role: "admin",
      }),
    ]);

    const run = await tasks.trigger<typeof createTopicsAndQueries>(
      "create-topics-and-queries",
      {
        organizationId,
      },
    );

    run.publicAccessToken;

    state.output = {
      success: true,
      data: {
        slug: slugify(parsed.data.name),
        run: {
          id: run.id,
          publicAccessToken: run.publicAccessToken,
        },
      },
    };
  } catch (err) {
    // Handle unique constraint violations
    if (err instanceof Error && err.message.includes("unique constraint")) {
      if (err.message.includes("slug")) {
        state.output = {
          success: false,
          error: "An organization with this slug already exists",
        };
      } else {
        state.output = {
          success: false,
          error: "Organization already exists",
        };
      }
    } else {
      state.output = {
        success: false,
        error:
          err instanceof Error ? err.message : "Failed to create organization",
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
