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
    mentions: text().array().default([""]),
    queryType: text("query_type").default("sector"),
    queryText: text("query_text"),
    queryExecutionId: uuid("query_execution_id"),
  },
  (table) => [
    index("idx_sources_mentions").using(
      "gin",
      table.mentions.asc().nullsLast().op("array_ops"),
    ),
    index("idx_sources_query_type").using(
      "btree",
      table.queryType.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("sources_exec_url_key").using(
      "btree",
      table.queryExecutionId.asc().nullsLast().op("text_ops"),
      table.url.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.domainId],
      foreignColumns: [domains.id],
      name: "sources_domain_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "sources_model_id_fkey",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "sources_project_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.queryExecutionId],
      foreignColumns: [queryExecutions.id],
      name: "sources_query_execution_id_fkey",
    }),
    check(
      "check_query_type",
      sql`query_type = ANY (ARRAY['sector'::text, 'product'::text])`,
    ),
  ],
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
