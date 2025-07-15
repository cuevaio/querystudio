"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  competitors,
  domains,
  executions,
  projects,
  queries,
  queryExecutions,
  sources,
} from "@/db/schema";

type ProjectSelect = typeof projects.$inferSelect;
export type ExecutionWithQueryExecutions = typeof executions.$inferSelect & {
  queryExecutions: (typeof queryExecutions.$inferSelect & {
    query: typeof queries.$inferSelect | null;
  })[];
};
export type SourceWithDomain = typeof sources.$inferSelect & {
  domain: typeof domains.$inferSelect;
};
type CompetitorSelect = typeof competitors.$inferSelect;
type DomainSelect = typeof domains.$inferSelect;

interface ResultsClientProps {
  project: Pick<ProjectSelect, "id" | "name">;
  executions: ExecutionWithQueryExecutions[];
  allSources: SourceWithDomain[];
  competitors: CompetitorSelect[];
  domains: DomainSelect[];
  totalQueries: number;
}

export default function ResultsClient({
  project,
  executions,
  allSources,
  competitors,
  domains,
  totalQueries,
}: ResultsClientProps) {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null,
  );

  // Get filtered data based on selected execution
  const getFilteredSources = () => {
    if (!selectedExecutionId) return allSources;

    const selectedExecution = executions.find(
      (e) => e.id === selectedExecutionId,
    );
    if (!selectedExecution) return allSources;

    const executionQueryIds = selectedExecution.queryExecutions.map(
      (qe) => qe.id,
    );
    return allSources.filter(
      (source) =>
        source.queryExecutionId &&
        executionQueryIds.includes(source.queryExecutionId),
    );
  };

  const filteredSources = getFilteredSources();
  const isFiltered = selectedExecutionId !== null;

  // Calculate stats
  const totalExecutions = executions.length;
  const totalSources = isFiltered ? filteredSources.length : allSources.length;
  const totalCompetitors = competitors.length;
  const _totalDomains = domains.length;
  const displayedQueries = isFiltered
    ? executions.find((e) => e.id === selectedExecutionId)?.queryExecutions
        .length || 0
    : totalQueries;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Analysis Results</h1>
        <p className="text-muted-foreground">
          Summary of analysis results for {project.name}
          {isFiltered && (
            <span className="ml-2">
              • Filtered by execution #{selectedExecutionId?.slice(-8)}
              <button
                type="button"
                onClick={() => setSelectedExecutionId(null)}
                className="ml-2 text-blue-600 hover:underline"
              >
                (Clear filter)
              </button>
            </span>
          )}
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
            <div className="font-bold text-2xl">{displayedQueries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Sources Found</CardTitle>
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
              {executions.map((execution) => (
                <button
                  type="button"
                  onKeyDown={() => {
                    setSelectedExecutionId(
                      selectedExecutionId === execution.id
                        ? null
                        : execution.id,
                    );
                  }}
                  key={execution.id}
                  className={`cursor-pointer rounded border-b p-2 pb-3 transition-colors last:border-b-0 ${
                    selectedExecutionId === execution.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() =>
                    setSelectedExecutionId(
                      selectedExecutionId === execution.id
                        ? null
                        : execution.id,
                    )
                  }
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {execution.queryExecutions.length} queries
                      </Badge>
                      {selectedExecutionId === execution.id && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
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
              {domains.map((domain) => (
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
            <CardTitle>
              {isFiltered ? "Filtered Sources" : "Recent Sources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSources.slice(0, 20).map((source) => (
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
              {competitors.map((competitor, index) => (
                <div
                  key={competitor.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="min-w-[24px] justify-center text-xs"
                    >
                      #{index + 1}
                    </Badge>
                    <p className="font-medium text-sm">{competitor.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {competitor.mentionCount || 0} mentions
                    </Badge>
                    {competitor.lastMentionDate && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(
                          competitor.lastMentionDate,
                        ).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
