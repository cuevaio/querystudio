"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { membership, topic } from "@/db/schema";
import { nanoid } from "@/lib/nanoid";

// Create Topic Action
export type CreateTopicActionState = {
  input: {
    organizationId: string;
    name: string;
    description: string;
  };
  output:
    | { success: true; data: { id: string; name: string } }
    | { success: false; error?: string };
};

export async function createTopicAction(
  _prev: CreateTopicActionState,
  formData: FormData,
): Promise<CreateTopicActionState> {
  let slug: string | undefined;
  const raw = {
    organizationId: formData.get("organizationId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const schema = z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    name: z.string().min(1, "Topic name is required"),
    description: z.string().min(1, "Description is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateTopicActionState = {
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

    const topicId = nanoid();
    await db.insert(topic).values({
      id: topicId,
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      description: parsed.data.description,
    });

    state.output = {
      success: true,
      data: { id: topicId, name: parsed.data.name },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create topic",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
  }

  return state;
}

// Update Topic Action
export type UpdateTopicActionState = {
  input: {
    topicId: string;
    name: string;
  };
  output:
    | { success: true; data: { id: string; name: string } }
    | { success: false; error?: string };
};

export async function updateTopicAction(
  _prev: UpdateTopicActionState,
  formData: FormData,
): Promise<UpdateTopicActionState> {
  let slug: string | undefined;
  const raw = {
    topicId: formData.get("topicId") as string,
    name: formData.get("name") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
    name: z.string().min(1, "Topic name is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: UpdateTopicActionState = {
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

    const _topic = await db.query.topic.findFirst({
      where: eq(topic.id, parsed.data.topicId),
      with: {
        organization: true,
      },
    });

    if (!_topic) {
      state.output = {
        success: false,
        error: "Topic not found",
      };
      return state;
    }

    const _membership = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, userId),
        eq(membership.organizationId, _topic.organizationId),
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

    const { organization } = _topic;
    slug = organization.slug;

    await db
      .update(topic)
      .set({
        name: parsed.data.name,
        updatedAt: new Date(),
      })
      .where(eq(topic.id, parsed.data.topicId));

    state.output = {
      success: true,
      data: { id: parsed.data.topicId, name: parsed.data.name },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update topic",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
  }

  return state;
}

// Delete Topic Action
export type DeleteTopicActionState = {
  input: {
    topicId: string;
  };
  output:
    | { success: true; data: { id: string } }
    | { success: false; error?: string };
};

export async function deleteTopicAction(
  _prev: DeleteTopicActionState,
  formData: FormData,
): Promise<DeleteTopicActionState> {
  let slug: string | undefined;
  const raw = {
    topicId: formData.get("topicId") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: DeleteTopicActionState = {
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

    const _topic = await db.query.topic.findFirst({
      where: eq(topic.id, parsed.data.topicId),
      with: {
        organization: true,
      },
    });

    if (!_topic) {
      state.output = {
        success: false,
        error: "Topic not found",
      };
      return state;
    }

    const _membership = await db.query.membership.findFirst({
      where: and(
        eq(membership.userId, userId),
        eq(membership.organizationId, _topic.organizationId),
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

    const { organization } = _topic;
    slug = organization.slug;

    await db.delete(topic).where(eq(topic.id, parsed.data.topicId));

    state.output = {
      success: true,
      data: { id: parsed.data.topicId },
    };
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete topic",
    };
  }

  if (slug) {
    revalidatePath(`/${slug}`);
  }

  return state;
}
