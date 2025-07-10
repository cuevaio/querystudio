"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { membership, query } from "@/db/schema";
import { nanoid } from "@/lib/nanoid";

// Create Query Action
export type CreateQueryActionState = {
  input: {
    topicId: string;
    organizationId: string;
    content: string;
  };
  output:
    | { success: true; data: { id: string; content: string } }
    | { success: false; error?: string };
};

export async function createQueryAction(
  _prev: CreateQueryActionState,
  formData: FormData,
): Promise<CreateQueryActionState> {
  let slug: string | undefined;
  const raw = {
    topicId: formData.get("topicId") as string,
    organizationId: formData.get("organizationId") as string,
    content: formData.get("content") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
    organizationId: z.string().min(1, "Organization ID is required"),
    content: z.string().min(1, "Query content is required"),
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

    const _membership = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, userId),
        eq(membership.organizationId, parsed.data.organizationId),
      ),
      with: {
        organization: true,
      },
    });

    if (!_membership) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const { organization } = _membership;
    slug = organization.slug;

    const queryId = nanoid();

    await db.insert(query).values({
      id: queryId,
      topicId: parsed.data.topicId,
      organizationId: parsed.data.organizationId,
      content: parsed.data.content,
      queryType: "market", // Default to market query
    });

    state.output = {
      success: true,
      data: { id: queryId, content: parsed.data.content },
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
    content: string;
  };
  output:
    | { success: true; data: { id: string; content: string } }
    | { success: false; error?: string };
};

export async function updateQueryAction(
  _prev: UpdateQueryActionState,
  formData: FormData,
): Promise<UpdateQueryActionState> {
  let slug: string | undefined;
  const raw = {
    queryId: formData.get("queryId") as string,
    content: formData.get("content") as string,
  };

  const schema = z.object({
    queryId: z.string().min(1, "Query ID is required"),
    content: z.string().min(1, "Query content is required"),
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

    const _query = await db.query.query.findFirst({
      where: eq(query.id, parsed.data.queryId),
      with: {
        organization: true,
      },
    });

    if (!_query) {
      state.output = {
        success: false,
        error: "Query not found",
      };
      return state;
    }

    const _membership = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, userId),
        eq(membership.organizationId, _query.organizationId),
      ),
      with: {
        organization: true,
      },
    });

    if (!_membership) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const { organization } = _query;
    slug = organization.slug;

    await db
      .update(query)
      .set({
        content: parsed.data.content,
        updatedAt: new Date(),
      })
      .where(eq(query.id, parsed.data.queryId));

    state.output = {
      success: true,
      data: { id: parsed.data.queryId, content: parsed.data.content },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update query",
    };
  }

  if (slug) {
    revalidatePath(`/$slug}`);
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

    const _query = await db.query.query.findFirst({
      where: eq(query.id, parsed.data.queryId),
      with: {
        organization: true,
      },
    });

    if (!_query) {
      state.output = {
        success: false,
        error: "Query not found",
      };
      return state;
    }

    const _membership = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, userId),
        eq(membership.organizationId, _query.organizationId),
      ),
      with: {
        organization: true,
      },
    });

    if (!_membership) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const { organization } = _query;
    slug = organization.slug;

    await db.delete(query).where(eq(query.id, parsed.data.queryId));

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
