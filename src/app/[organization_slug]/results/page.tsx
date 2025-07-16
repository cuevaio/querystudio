import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  competitors as competitorsTable,
  domains as domainsTable,
  projects,
  sources as sourcesTable,
} from "@/db/schema";
import ResultsClient, {
  type ExecutionWithQueryExecutions,
  type SourceWithDomain,
} from "./results-client";

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
              model: {
                columns: {
                  vendor: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get all query execution IDs from all executions for this project
  const _latestExecution = project.executions[0];

  // Get competitors with mentions, including model information, ordered by mention count
  const allCompetitors = await db.query.competitors.findMany({
    where: eq(competitorsTable.projectId, project.id),
    with: {
      mentions: {
        with: {
          source: {
            with: {
              queryExecution: {
                with: {
                  model: {
                    columns: {
                      vendor: true,
                      name: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: (competitor, { desc }) => [
      desc(competitor.mentionCount),
      desc(competitor.lastMentionDate),
    ],
  });

  // Filter to only show competitors with mentions (default is 1, so > 1 means actual mentions)
  const competitors = allCompetitors
    .filter((c) => (c.mentionCount || 1) > 1)
    .slice(0, 15);

  // Get sources from ALL executions for this project
  const sources = await db.query.sources.findMany({
    where: eq(sourcesTable.projectId, project.id),
    limit: 20,
    with: {
      domain: {
        columns: {
          name: true,
          category: true,
        },
      },
    },
    orderBy: (source, { desc }) => [desc(source.queryExecutionId)],
  });

  // Get domains for this project
  const domains = await db.query.domains.findMany({
    where: eq(domainsTable.projectId, project.id),
    limit: 10,
  });

  return (
    <ResultsClient
      project={{
        id: project.id,
        name: project.name,
      }}
      executions={project.executions as ExecutionWithQueryExecutions[]}
      allSources={sources as SourceWithDomain[]}
      competitors={competitors}
      domains={domains}
    />
  );
}
