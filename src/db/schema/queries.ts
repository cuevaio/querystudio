import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
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
    projectId: uuid("project_id").notNull(),
    text: text().notNull(),
    country: text(),
    active: boolean().default(true),
    queryType: text("query_type").default("sector").notNull(),
  },
  (table) => ({
    queriesProjectIdIdx: index("queries_project_id_idx").using(
      "btree",
      table.projectId.asc().nullsLast(),
    ),
    queriesProjectIdFkey: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "queries_project_id_fkey",
    }),
    queriesTopicIdFkey: foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: "queries_topic_id_fkey",
    }),
  }),
);

export const queriesRelations = relations(queries, ({ one, many }) => ({
  project: one(projects, {
    fields: [queries.projectId],
    references: [projects.id],
  }),
  topic: one(topics, {
    fields: [queries.topicId],
    references: [topics.id],
  }),
  queryExecutions: many(queryExecutions),
}));

export type QueryInsert = typeof queries.$inferInsert;
