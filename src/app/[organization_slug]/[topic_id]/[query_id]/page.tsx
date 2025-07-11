import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { QueryActionsMenu } from "@/components/query-actions-menu";
import { QueryChatUI } from "@/components/query-chat-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { projectsUsers, queries } from "@/db/schema";

interface QueryPageProps {
  params: Promise<{
    organization_slug: string;
    topic_id: string;
    query_id: string;
  }>;
}

export default async function QueryPage({ params }: QueryPageProps) {
  const { organization_slug, topic_id, query_id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const queryData = await db.query.queries.findFirst({
    where: and(eq(queries.id, query_id)),
    with: {
      topic: {
        with: {
          project: true,
        },
      },
      project: true,
    },
  });

  if (!queryData) {
    notFound();
  }

  // Verify organization slug and topic ID match
  if (
    queryData.project?.slug !== organization_slug ||
    queryData.topicId !== topic_id
  ) {
    notFound();
  }

  // Check if user is member of organization
  const userMembership = await db.query.projectsUsers.findFirst({
    where: and(
      eq(projectsUsers.userId, userId),
      eq(projectsUsers.projectId, queryData.projectId),
    ),
  });

  if (!userMembership) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href={`/${organization_slug}/${topic_id}`}>
            <Button variant="ghost" className="h-auto p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {queryData.topic?.name}
            </Button>
          </Link>
        </div>

        {/* Query Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-4 font-bold text-3xl">{queryData.text}</h1>
              <div className="mb-4 flex items-center gap-2">
                <Badge
                  variant={
                    queryData.queryType === "product" ? "default" : "secondary"
                  }
                >
                  {queryData.queryType === "product"
                    ? "Product Query"
                    : "Sector Query"}
                </Badge>
                <Badge variant="outline">{queryData.topic?.name}</Badge>
                <Badge variant="outline">{queryData.project?.name}</Badge>
                <Badge variant="outline">
                  {queryData.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="ml-4">
              <QueryActionsMenu
                queryId={queryData.id}
                organizationSlug={organization_slug}
                topicId={topic_id}
              />
            </div>
          </div>
        </div>

        <QueryChatUI query={queryData.text} />
      </div>
    </div>
  );
}
