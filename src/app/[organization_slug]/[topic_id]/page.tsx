import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectsUsers, topics } from "@/db/schema";
import { isValidUUID } from "@/lib/utils";
import { TopicPageClient } from "./topic-page-client";

interface TopicPageProps {
  params: Promise<{
    organization_slug: string;
    topic_id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: TopicPageProps) {
  const { organization_slug, topic_id } = await params;

  // Validate that topic_id is a valid UUID
  if (!isValidUUID(topic_id)) {
    notFound();
    return;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId) {
    redirect("/signin");
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
