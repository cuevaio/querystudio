import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { queryExecutions } from "./query_executions";
import { topics } from "./topics";

export const queryTypeEnum = pgEnum("query_type", ["sector", "product"]);

export const queries = pgTable(
  "queries",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    topicId: uuid("topic_id"),
    projectId: uuid("project_id").notNull(),
    text: text().notNull(),
    country: text(),
    active: boolean().default(true),
    queryType: queryTypeEnum("query_type").default("sector").notNull(),
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
    }),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: "queries_topic_id_fkey",
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
