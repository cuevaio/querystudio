"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  competitors,
  domains,
  executions,
  mentions,
  projects,
  queries,
  queryExecutions,
  sources,
} from "@/db/schema";

type ProjectSelect = typeof projects.$inferSelect;
export type ExecutionWithQueryExecutions = typeof executions.$inferSelect & {
  queryExecutions: (typeof queryExecutions.$inferSelect & {
    query: typeof queries.$inferSelect | null;
    model: { vendor: string | null; name: string; color: string | null } | null;
  })[];
};
export type SourceWithDomain = typeof sources.$inferSelect & {
  domain: typeof domains.$inferSelect;
};
export type CompetitorWithMentions = typeof competitors.$inferSelect & {
  mentions: (typeof mentions.$inferSelect & {
    source:
      | (typeof sources.$inferSelect & {
          queryExecution:
            | (typeof queryExecutions.$inferSelect & {
                model: {
                  vendor: string | null;
                  name: string;
                  color: string | null;
                } | null;
              })
            | null;
        })
      | null;
  })[];
};
type DomainSelect = typeof domains.$inferSelect;

interface ResultsClientProps {
  project: Pick<ProjectSelect, "id" | "name">;
  executions: ExecutionWithQueryExecutions[];
  allSources: SourceWithDomain[];
  competitors: CompetitorWithMentions[];
  domains: DomainSelect[];
}

export default function ResultsClient({
  project,
  executions,
  allSources,
  competitors: allCompetitors,
  domains,
}: ResultsClientProps) {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null,
  );
  const [selectedVendor, setSelectedVendor] = useState<string>("all");

  // Get available vendors from executions
  const getAvailableVendors = () => {
    const vendors = new Set<string>();
    executions.forEach((execution) => {
      execution.queryExecutions.forEach((qe) => {
        if (qe.model?.vendor) {
          vendors.add(qe.model.vendor);
        }
      });
    });
    return Array.from(vendors).sort();
  };

  const _availableVendors = getAvailableVendors();

  // Get competitors filtered by vendor
  const getFilteredCompetitors = () => {
    if (selectedVendor === "all") return allCompetitors;

    return allCompetitors
      .filter((competitor) =>
        competitor.mentions.some(
          (mention) =>
            mention.source?.queryExecution?.model?.vendor === selectedVendor,
        ),
      )
      .map((competitor) => ({
        ...competitor,
        mentions: competitor.mentions.filter(
          (mention) =>
            mention.source?.queryExecution?.model?.vendor === selectedVendor,
        ),
      }));
  };

  const filteredCompetitors = getFilteredCompetitors();

  // Get filtered data based on selected execution and vendor
  const getFilteredData = () => {
    let filteredExecutions = executions;

    // Filter by vendor if not "all"
    if (selectedVendor !== "all") {
      filteredExecutions = executions
        .map((execution) => ({
          ...execution,
          queryExecutions: execution.queryExecutions.filter(
            (qe) => qe.model?.vendor === selectedVendor,
          ),
        }))
        .filter((execution) => execution.queryExecutions.length > 0);
    }

    // If specific execution is selected, filter to that execution
    if (selectedExecutionId) {
      const selectedExecution = filteredExecutions.find(
        (e) => e.id === selectedExecutionId,
      );
      if (!selectedExecution) return { executions: [], sources: allSources };

      const executionQueryIds = selectedExecution.queryExecutions.map(
        (qe) => qe.id,
      );
      const sources = allSources.filter(
        (source) =>
          source.queryExecutionId &&
          executionQueryIds.includes(source.queryExecutionId),
      );
      return { executions: [selectedExecution], sources };
    }

    // Filter sources based on vendor
    let sources = allSources;
    if (selectedVendor !== "all") {
      const vendorQueryExecutionIds = filteredExecutions.flatMap((execution) =>
        execution.queryExecutions.map((qe) => qe.id),
      );
      sources = allSources.filter(
        (source) =>
          source.queryExecutionId &&
          vendorQueryExecutionIds.includes(source.queryExecutionId),
      );
    }

    return { executions: filteredExecutions, sources };
  };

  const { executions: filteredExecutions, sources: filteredSources } =
    getFilteredData();

  const isFiltered = selectedExecutionId !== null || selectedVendor !== "all";

  // Calculate stats
  const totalExecutions = filteredExecutions.length;
  const totalSources = filteredSources.length;
  const totalCompetitors = filteredCompetitors.length;
  const _totalDomains = domains.length;
  const displayedQueries = filteredExecutions.reduce(
    (sum, execution) => sum + execution.queryExecutions.length,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Analysis Results</h1>
        <p className="text-muted-foreground">
          Summary of analysis results for {project.name}
          {isFiltered && (
            <span className="ml-2">
              {selectedVendor !== "all" &&
                `• Filtered by vendor: ${selectedVendor}`}
              {selectedExecutionId &&
                ` • Execution #${selectedExecutionId?.slice(-8)}`}
              <button
                type="button"
                onClick={() => {
                  setSelectedExecutionId(null);
                  setSelectedVendor("all");
                }}
                className="ml-2 text-blue-600 hover:underline"
              >
                (Clear filters)
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

      {/* Vendor Tabs */}
      <div className="mb-8">
        <Tabs value={selectedVendor} onValueChange={setSelectedVendor}>
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="all">All Vendors</TabsTrigger>
            <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="am">Agile Monkeys</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedVendor} className="mt-6">
            {/* Content will be rendered below */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Executions */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExecutions.map((execution) => (
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
              {filteredCompetitors.map((competitor, index) => (
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedVendor === "all"
                        ? competitor.mentionCount || 0
                        : competitor.mentions.length}{" "}
                      mentions
                    </Badge>
                    {competitor.lastMentionDate && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(
                          competitor.lastMentionDate,
                        ).toLocaleDateString()}
                      </Badge>
                    )}
                    {/* Show unique models for this competitor */}
                    {(() => {
                      const uniqueModels = Array.from(
                        new Set(
                          competitor.mentions
                            .map((m) => m.source?.queryExecution?.model)
                            .filter(Boolean)
                            .map((model) => `${model?.vendor}-${model?.name}`),
                        ),
                      );
                      return uniqueModels.slice(0, 2).map((modelKey) => {
                        const model = competitor.mentions.find(
                          (m) =>
                            m.source?.queryExecution?.model &&
                            `${m.source.queryExecution.model.vendor}-${m.source.queryExecution.model.name}` ===
                              modelKey,
                        )?.source?.queryExecution?.model;
                        return model ? (
                          <Badge
                            key={modelKey}
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: model.color || undefined,
                            }}
                          >
                            {model.vendor}
                          </Badge>
                        ) : null;
                      });
                    })()}
                    {(() => {
                      const uniqueModels = Array.from(
                        new Set(
                          competitor.mentions
                            .map((m) => m.source?.queryExecution?.model)
                            .filter(Boolean)
                            .map((model) => `${model?.vendor}-${model?.name}`),
                        ),
                      );
                      return uniqueModels.length > 2 ? (
                        <Badge variant="outline" className="text-xs">
                          +{uniqueModels.length - 2} more
                        </Badge>
                      ) : null;
                    })()}
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
