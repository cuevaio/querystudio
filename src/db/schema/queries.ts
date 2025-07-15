import { relations, sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgPolicy,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { queryExecutions } from "./query_executions";
import { topics } from "./topics";

export const queries = pgTable(
  "queries",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    topicId: uuid("topic_id"),
    text: text().notNull(),
    country: text(),
    active: boolean().default(true),
    queryType: text("query_type").default("sector").notNull(),
    projectId: uuid("project_id").notNull(),
  },
  (table) => [
    index("queries_project_id_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "queries_project_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: "queries_topic_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("Enable read access for all users", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Users can create queries for their projects", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can delete queries for their projects", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can update queries for their projects", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
  ],
);

export const queriesRelations = relations(queries, ({ one, many }) => ({
  queryExecutions: many(queryExecutions),
  project: one(projects, {
    fields: [queries.projectId],
    references: [projects.id],
  }),
  topic: one(topics, {
    fields: [queries.topicId],
    references: [topics.id],
  }),
}));

export type QueryInsert = typeof queries.$inferInsert;
