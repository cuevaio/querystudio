import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { projectsUsers, topics } from "@/db/schema";
import { userId } from "@/lib/user-id";
import { isValidUUID } from "@/lib/utils";
import { TopicPageClient } from "./topic-page-client";

interface TopicPageProps {
  params: Promise<{
    organization_slug: string;
    topic_id: string;
  }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { organization_slug, topic_id } = await params;

  // Validate that topic_id is a valid UUID
  if (!isValidUUID(topic_id)) {
    notFound();
    return;
  }

  const topicData = await db.query.topics.findFirst({
    where: and(eq(topics.id, topic_id)),
    with: {
      project: true,
      queries: {
        orderBy: (query, { asc }) => [asc(query.text)],
      },
    },
  });

  if (!topicData) {
    notFound();
  }

  // Verify organization slug matches
  if (topicData.project?.slug !== organization_slug) {
    notFound();
  }

  // Check if user is member of organization
  const userMembership = await db.query.projectsUsers.findFirst({
    where: and(
      eq(projectsUsers.userId, userId),
      eq(projectsUsers.projectId, topicData.projectId ?? ""),
    ),
  });

  if (!userMembership) {
    redirect("/");
  }

  return (
    <TopicPageClient
      topicData={topicData}
      organizationSlug={organization_slug}
    />
  );
}
