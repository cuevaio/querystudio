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
  };
  output:
    | { success: true; data: { id: string; text: string } }
    | { success: false; error?: string };
};

export async function createQueryAction(
  _prev: CreateQueryActionState,
  formData: FormData,
): Promise<CreateQueryActionState> {
  let slug: string | undefined;
  const raw = {
    topicId: formData.get("topicId") as string,
    projectId: formData.get("projectId") as string,
    text: formData.get("text") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
    projectId: z.string().min(1, "Project ID is required"),
    text: z.string().min(1, "Query text is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateQueryActionState = {
    input: raw,
    output: { success: false },
  };

  if (!parsed.success) {
    state.output = {
      success: false,
      error: "Invalid input data",
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
        error: "Unauthorized",
      };
      return state;
    }

    const userId = session.user.id;

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

    const { project } = _projectUser;
    slug = project.slug || undefined;

    const insertedQueries = await db
      .insert(queries)
      .values({
        topicId: parsed.data.topicId,
        projectId: parsed.data.projectId,
        text: parsed.data.text,
        queryType: "sector", // Default to sector query
      })
      .returning();

    const queryId = insertedQueries[0].id;

    state.output = {
      success: true,
      data: { id: queryId, text: parsed.data.text },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create query",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
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
  let slug: string | undefined;
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
      error: "Invalid input data",
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
        error: "Unauthorized",
      };
      return state;
    }

    const userId = session.user.id;

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

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, _query.projectId),
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

    const { project } = _query;
    slug = project?.slug || undefined;

    await db
      .update(queries)
      .set({
        text: parsed.data.text,
      })
      .where(eq(queries.id, parsed.data.queryId));

    state.output = {
      success: true,
      data: { id: parsed.data.queryId, text: parsed.data.text },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update query",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
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
  let slug: string | undefined;
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
      error: "Invalid input data",
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
        error: "Unauthorized",
      };
      return state;
    }

    const userId = session.user.id;

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

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, _query.projectId),
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

    const { project } = _query;
    slug = project?.slug || undefined;

    await db.delete(queries).where(eq(queries.id, parsed.data.queryId));

    state.output = {
      success: true,
      data: { id: parsed.data.queryId },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete query",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
  }

  return state;
}
