"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectsUsers, queries } from "@/db/schema";

// Create Query Action
export type CreateQueryActionState = {
  input: {
    topicId: string;
    projectId: string;
    text: string;
    queryType: string;
  };
  output:
    | { success: true; data: { id: string; text: string; queryType: string } }
    | { success: false; error?: string };
};

export async function createQueryAction(
  _prev: CreateQueryActionState,
  formData: FormData,
): Promise<CreateQueryActionState> {
  const raw = {
    topicId: formData.get("topicId") as string,
    projectId: formData.get("projectId") as string,
    text: formData.get("text") as string,
    queryType: formData.get("queryType") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
    projectId: z.string().min(1, "Project ID is required"),
    text: z.string().min(1, "Query text is required"),
    queryType: z.enum(["product", "sector"], {
      required_error: "Query type is required",
    }),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateQueryActionState = {
    input: raw,
    output: { success: false },
  };

  if (!parsed.success) {
    state.output = {
      success: false,
      error: "Invalid input",
    };
    return state;
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, parsed.data.projectId),
      ),
      with: {
        project: true,
      },
    });

    if (!_projectUser) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const insertedQueries = await db
      .insert(queries)
      .values({
        topicId: parsed.data.topicId,
        projectId: parsed.data.projectId,
        text: parsed.data.text,
        queryType: parsed.data.queryType,
      })
      .returning();

    const query = insertedQueries[0];

    state.output = {
      success: true,
      data: {
        id: query.id,
        text: query.text,
        queryType: query.queryType || "",
      },
    };

    // Revalidate pages
    if (_projectUser.project.slug) {
      revalidatePath(`/${_projectUser.project.slug}`);
      revalidatePath(`/${_projectUser.project.slug}/${parsed.data.topicId}`);
    }
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return state;
}

// Update Query Action
export type UpdateQueryActionState = {
  input: {
    queryId: string;
    text: string;
  };
  output:
    | { success: true; data: { id: string; text: string } }
    | { success: false; error?: string };
};

export async function updateQueryAction(
  _prev: UpdateQueryActionState,
  formData: FormData,
): Promise<UpdateQueryActionState> {
  const raw = {
    queryId: formData.get("queryId") as string,
    text: formData.get("text") as string,
  };

  const schema = z.object({
    queryId: z.string().min(1, "Query ID is required"),
    text: z.string().min(1, "Query text is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: UpdateQueryActionState = {
    input: raw,
    output: { success: false },
  };

  if (!parsed.success) {
    state.output = {
      success: false,
      error: "Invalid input",
    };
    return state;
  }

  try {
    const _query = await db.query.queries.findFirst({
      where: eq(queries.id, parsed.data.queryId),
      with: {
        project: true,
      },
    });

    if (!_query) {
      state.output = {
        success: false,
        error: "Query not found",
      };
      return state;
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, _query.projectId),
      ),
    });

    if (!_projectUser) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const updatedQueries = await db
      .update(queries)
      .set({
        text: parsed.data.text,
      })
      .where(eq(queries.id, parsed.data.queryId))
      .returning();

    const updatedQuery = updatedQueries[0];

    state.output = {
      success: true,
      data: { id: updatedQuery.id, text: updatedQuery.text },
    };

    // Revalidate pages
    if (_query.project?.slug) {
      revalidatePath(`/${_query.project.slug}`);
      revalidatePath(`/${_query.project.slug}/${_query.topicId}`);
    }
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return state;
}

// Delete Query Action
export type DeleteQueryActionState = {
  input: {
    queryId: string;
  };
  output:
    | { success: true; data: { id: string } }
    | { success: false; error?: string };
};

export async function deleteQueryAction(
  _prev: DeleteQueryActionState,
  formData: FormData,
): Promise<DeleteQueryActionState> {
  const raw = {
    queryId: formData.get("queryId") as string,
  };

  const schema = z.object({
    queryId: z.string().min(1, "Query ID is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: DeleteQueryActionState = {
    input: raw,
    output: { success: false },
  };

  if (!parsed.success) {
    state.output = {
      success: false,
      error: "Invalid input",
    };
    return state;
  }

  try {
    const _query = await db.query.queries.findFirst({
      where: eq(queries.id, parsed.data.queryId),
      with: {
        project: true,
      },
    });

    if (!_query) {
      state.output = {
        success: false,
        error: "Query not found",
      };
      return state;
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId) {
      throw new Error("User not found");
    }

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, _query.projectId),
      ),
    });

    if (!_projectUser) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    await db.delete(queries).where(eq(queries.id, parsed.data.queryId));

    state.output = {
      success: true,
      data: { id: parsed.data.queryId },
    };

    // Revalidate pages
    if (_query.project?.slug) {
      revalidatePath(`/${_query.project.slug}`);
      revalidatePath(`/${_query.project.slug}/${_query.topicId}`);
    }
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return state;
}
