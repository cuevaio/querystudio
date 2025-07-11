import { relations } from "drizzle-orm";
import { foreignKey, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { queryExecutions } from "./query_executions";

export const executions = pgTable(
  "executions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id"),
    executedAt: timestamp("executed_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "executions_project_id_fkey",
    }),
  ],
);

export const executionsRelations = relations(executions, ({ one, many }) => ({
  queryExecutions: many(queryExecutions),
  project: one(projects, {
    fields: [executions.projectId],
    references: [projects.id],
  }),
}));
