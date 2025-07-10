import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { membership, organization, topic } from "@/db/schema";

interface OrganizationPageProps {
  params: Promise<{
    organization_slug: string;
  }>;
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { organization_slug } = await params;

  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  // Get organization with topics
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, organization_slug),
    with: {
      topics: {
        where: eq(topic.isActive, true),
        orderBy: (topic, { asc }) => [asc(topic.name)],
        with: {
          queries: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!org) {
    notFound();
  }

  // Check if user is member of organization
  const userMembership = await db.query.membership.findFirst({
    where: and(
      eq(membership.userId, userId),
      eq(membership.organizationId, org.id),
    ),
  });

  if (!userMembership) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Organization Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">{org.name}</h1>
          <p className="mb-4 text-muted-foreground">{org.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{org.sector}</Badge>
            <Badge variant="secondary">{org.country}</Badge>
            <Badge variant="secondary">{org.language}</Badge>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">Topics</h2>
            <Badge variant="outline">
              {org.topics.length} topic{org.topics.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {org.topics.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>No topics found for this organization.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {org.topics.map((topicItem) => (
                <Link
                  key={topicItem.id}
                  href={`/${organization_slug}/${topicItem.id}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg">
                        {topicItem.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
                        {topicItem.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {topicItem.queries.length} quer
                          {topicItem.queries.length !== 1 ? "ies" : "y"}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          View queries →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
