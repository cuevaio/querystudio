import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projectModels } from "./project_models";
import { queryExecutions } from "./query_executions";
import { sources } from "./sources";

export const models = pgTable("models", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  model: text(),
  color: text(),
});

export const modelsRelations = relations(models, ({ many }) => ({
  sources: many(sources),
  queryExecutions: many(queryExecutions),
  projectModels: many(projectModels),
}));
