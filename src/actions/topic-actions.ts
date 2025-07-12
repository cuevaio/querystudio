"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectsUsers, topics } from "@/db/schema";

// Create Topic Action
export type CreateTopicActionState = {
  input: {
    projectId: string;
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
    projectId: formData.get("projectId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const schema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
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

    const insertedTopics = await db
      .insert(topics)
      .values({
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        description: parsed.data.description,
      })
      .returning();

    const topicId = insertedTopics[0].id;

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

    const _topic = await db.query.topics.findFirst({
      where: eq(topics.id, parsed.data.topicId),
      with: {
        project: true,
      },
    });

    if (!_topic) {
      state.output = {
        success: false,
        error: "Topic not found",
      };
      return state;
    }

    if (!_topic.project) {
      state.output = {
        success: false,
        error: "Project not found",
      };
      return state;
    }

    const projectId = _topic.project.id;

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, projectId),
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

    const { project } = _topic;
    slug = project?.slug || undefined;

    await db
      .update(topics)
      .set({
        name: parsed.data.name,
      })
      .where(eq(topics.id, parsed.data.topicId));

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

    const _topic = await db.query.topics.findFirst({
      where: eq(topics.id, parsed.data.topicId),
      with: {
        project: true,
      },
    });

    if (!_topic) {
      state.output = {
        success: false,
        error: "Topic not found",
      };
      return state;
    }

    if (!_topic.project) {
      state.output = {
        success: false,
        error: "Project not found",
      };
      return state;
    }

    const projectId = _topic.project.id;

    const _projectUser = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, projectId),
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

    const { project } = _topic;
    slug = project?.slug || undefined;

    await db.delete(topics).where(eq(topics.id, parsed.data.topicId));

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
