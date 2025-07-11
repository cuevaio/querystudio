import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { projects } from "@/db/schema";

interface ResultsPageProps {
  params: Promise<{
    organization_slug: string;
  }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { organization_slug } = await params;

  // Get project with all related data
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, organization_slug),
    with: {
      executions: {
        orderBy: (execution, { desc }) => [desc(execution.executedAt)],
        limit: 10,
        with: {
          queryExecutions: {
            with: {
              query: {
                columns: {
                  text: true,
                  queryType: true,
                },
              },
            },
          },
        },
      },
      sources: {
        limit: 20,
        with: {
          domain: {
            columns: {
              name: true,
              category: true,
            },
          },
        },
      },
      competitors: {
        orderBy: (competitor, { desc }) => [desc(competitor.lastMentionDate)],
        limit: 15,
      },
      domains: {
        limit: 10,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Calculate summary stats
  const totalExecutions = project.executions.length;
  const totalSources = project.sources.length;
  const totalCompetitors = project.competitors.length;
  const _totalDomains = project.domains.length;

  const latestExecution = project.executions[0];
  const totalQueries = latestExecution?.queryExecutions.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">Analysis Results</h1>
          <p className="text-muted-foreground">
            Summary of analysis results for {project.name}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">
                Total Executions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{totalExecutions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">
                Queries Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{totalQueries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">
                Sources Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{totalSources}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">
                Competitors Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{totalCompetitors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.executions.map((execution) => (
                  <div
                    key={execution.id}
                    className="border-b pb-3 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          Execution #{execution.id.slice(-8)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {execution.executedAt
                            ? new Date(execution.executedAt).toLocaleString()
                            : "No date"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {execution.queryExecutions.length} queries
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Top Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{domain.name}</p>
                      {domain.category && (
                        <p className="text-muted-foreground text-xs">
                          {domain.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources and Competitors */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.sources.map((source) => (
                  <div key={source.id} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="truncate font-medium text-sm">
                          {source.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {source.domain?.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {source.queryType}
                      </Badge>
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-blue-600 text-xs hover:underline"
                      >
                        {source.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competitors Mentioned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.competitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="flex items-center justify-between"
                  >
                    <p className="font-medium text-sm">{competitor.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {competitor.lastMentionDate
                        ? new Date(
                            competitor.lastMentionDate,
                          ).toLocaleDateString()
                        : "No date"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
