import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { projectsUsers, topics } from "@/db/schema";

interface TopicPageProps {
  params: Promise<{
    organization_slug: string;
    topic_id: string;
  }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { organization_slug, topic_id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href={`/${organization_slug}`}>
            <Button variant="ghost" className="h-auto p-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {topicData.project?.name}
            </Button>
          </Link>
        </div>

        {/* Topic Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">{topicData.name}</h1>
          <p className="mb-4 text-muted-foreground">{topicData.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {topicData.queries.length} quer
              {topicData.queries.length !== 1 ? "ies" : "y"}
            </Badge>
            <Badge variant="outline">{topicData.project?.name}</Badge>
          </div>
        </div>

        {/* Queries Section */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl">Queries</h2>

          {topicData.queries.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>No queries found for this topic.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topicData.queries.map((queryItem, index) => (
                <Link
                  key={queryItem.id}
                  href={`/${organization_slug}/${topic_id}/${queryItem.id}`}
                  className="block transition-transform hover:scale-[1.01]"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-medium text-lg">
                            {queryItem.text}
                          </CardTitle>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <Badge
                            variant={
                              queryItem.queryType === "product"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {queryItem.queryType === "product"
                              ? "Product"
                              : "Sector"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {topicData.queries.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Topic:</span>
                <span className="ml-2 text-muted-foreground">
                  {topicData.name}
                </span>
              </div>
              <div>
                <span className="font-medium">Product Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {
                    topicData.queries.filter((q) => q.queryType === "product")
                      .length
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Sector Queries:</span>
                <span className="ml-2 text-muted-foreground">
                  {
                    topicData.queries.filter((q) => q.queryType === "sector")
                      .length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
