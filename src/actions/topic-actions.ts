"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectsUsers, topics } from "@/db/schema";
import { userId } from "@/lib/user-id";

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
    description: string;
  };
  output:
    | { success: true; data: { id: string; name: string; description: string } }
    | { success: false; error?: string };
};

export async function updateTopicAction(
  _prev: UpdateTopicActionState,
  formData: FormData,
): Promise<UpdateTopicActionState> {
  const raw = {
    topicId: formData.get("topicId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const schema = z.object({
    topicId: z.string().min(1, "Topic ID is required"),
    name: z.string().min(1, "Topic name is required"),
    description: z.string().min(1, "Description is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: UpdateTopicActionState = {
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
    });

    if (!_projectUser) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    // Update the topic and get the updated values
    const updatedTopics = await db
      .update(topics)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
      })
      .where(eq(topics.id, parsed.data.topicId))
      .returning();

    const updatedTopic = updatedTopics[0];

    state.output = {
      success: true,
      data: {
        id: updatedTopic.id,
        name: updatedTopic.name,
        description: updatedTopic.description || "",
      },
    };

    // Revalidate pages
    if (_topic.project.slug) {
      revalidatePath(`/${_topic.project.slug}`);
      revalidatePath(`/${_topic.project.slug}/${parsed.data.topicId}`);
    }
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
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
      error: "Invalid input",
    };
    return state;
  }

  try {
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
    });

    if (!_projectUser) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    await db.delete(topics).where(eq(topics.id, parsed.data.topicId));

    state.output = {
      success: true,
      data: { id: parsed.data.topicId },
    };

    // Revalidate the organization page
    if (_topic.project.slug) {
      revalidatePath(`/${_topic.project.slug}`);
    }
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return state;
}

// Create Topic from Organization Slug Action
export type CreateTopicFromSlugActionState = {
  input: {
    organizationSlug: string;
    name: string;
    description: string;
  };
  output:
    | { success: true; data: { id: string; name: string } }
    | { success: false; error?: string };
};

export async function createTopicFromSlugAction(
  _prev: CreateTopicFromSlugActionState,
  formData: FormData,
): Promise<CreateTopicFromSlugActionState> {
  const raw = {
    organizationSlug: formData.get("organizationSlug") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const schema = z.object({
    organizationSlug: z.string().min(1, "Organization slug is required"),
    name: z.string().min(1, "Topic name is required"),
    description: z.string().min(1, "Description is required"),
  });

  const parsed = schema.safeParse(raw);

  const state: CreateTopicFromSlugActionState = {
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
    // Get project by organization slug
    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, parsed.data.organizationSlug),
    });

    if (!project) {
      state.output = {
        success: false,
        error: "Organization not found",
      };
      return state;
    }

    // Check if user is member of organization
    const userMembership = await db.query.projectsUsers.findFirst({
      where: and(
        eq(projectsUsers.userId, userId),
        eq(projectsUsers.projectId, project.id),
      ),
    });

    if (!userMembership) {
      state.output = {
        success: false,
        error: "Unauthorized",
      };
      return state;
    }

    const insertedTopics = await db
      .insert(topics)
      .values({
        projectId: project.id,
        name: parsed.data.name,
        description: parsed.data.description,
      })
      .returning();

    const topicId = insertedTopics[0].id;

    state.output = {
      success: true,
      data: { id: topicId, name: parsed.data.name },
    };

    // Revalidate
    revalidatePath(`/${parsed.data.organizationSlug}`);
  } catch (err) {
    state.output = {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return state;
}
