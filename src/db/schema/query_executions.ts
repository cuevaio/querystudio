import { relations } from "drizzle-orm";
import { foreignKey, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { executions } from "./executions";
import { models } from "./models";
import { queries } from "./queries";
import { sources } from "./sources";

export const queryExecutions = pgTable(
  "query_executions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    executionId: uuid("execution_id"),
    queryId: uuid("query_id"),
    modelId: uuid("model_id"),
    response: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.executionId],
      foreignColumns: [executions.id],
      name: "query_executions_execution_id_fkey",
    }),
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "query_executions_model_id_fkey",
    }),
    foreignKey({
      columns: [table.queryId],
      foreignColumns: [queries.id],
      name: "query_executions_query_id_fkey",
    }),
  ],
);

export const queryExecutionsRelations = relations(
  queryExecutions,
  ({ one, many }) => ({
    execution: one(executions, {
      fields: [queryExecutions.executionId],
      references: [executions.id],
    }),
    model: one(models, {
      fields: [queryExecutions.modelId],
      references: [models.id],
    }),
    query: one(queries, {
      fields: [queryExecutions.queryId],
      references: [queries.id],
    }),
    sources: many(sources),
  }),
);
