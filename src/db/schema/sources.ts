import { relations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { domains } from "./domains";
import { mentions } from "./mentions";
import { models } from "./models";
import { projects } from "./projects";
import { queryExecutions } from "./query_executions";

export const sources = pgTable(
  "sources",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    domainId: uuid("domain_id"),
    projectId: uuid("project_id"),
    url: text().notNull(),
    title: text(),
    modelId: uuid("model_id"),
    queryExecutionId: uuid("query_execution_id"),
    queryText: text("query_text"),
    queryType: text("query_type").default("sector"),
    mentions: text().array().default([""]),
  },
  (table) => ({
    idxSourcesMentions: index("idx_sources_mentions").using(
      "gin",
      table.mentions.asc().nullsLast(),
    ),
    idxSourcesQueryType: index("idx_sources_query_type").using(
      "btree",
      table.queryType.asc().nullsLast(),
    ),
    sourcesExecUrlKey: uniqueIndex("sources_exec_url_key").using(
      "btree",
      table.queryExecutionId.asc().nullsLast(),
      table.url.asc().nullsLast(),
    ),
    sourcesDomainIdFkey: foreignKey({
      columns: [table.domainId],
      foreignColumns: [domains.id],
      name: "sources_domain_id_fkey",
    }),
    sourcesModelIdFkey: foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "sources_model_id_fkey",
    }),
    sourcesProjectIdFkey: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "sources_project_id_fkey",
    }),
    sourcesQueryExecutionIdFkey: foreignKey({
      columns: [table.queryExecutionId],
      foreignColumns: [queryExecutions.id],
      name: "sources_query_execution_id_fkey",
    }),
    checkQueryType: check("check_query_type", sql`query_type = 'sector'::text`),
  }),
);

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  mentions: many(mentions),
  domain: one(domains, {
    fields: [sources.domainId],
    references: [domains.id],
  }),
  model: one(models, {
    fields: [sources.modelId],
    references: [models.id],
  }),
  project: one(projects, {
    fields: [sources.projectId],
    references: [projects.id],
  }),
  queryExecution: one(queryExecutions, {
    fields: [sources.queryExecutionId],
    references: [queryExecutions.id],
  }),
}));
