import { relations } from "drizzle-orm";
import { foreignKey, pgTable, unique, uuid } from "drizzle-orm/pg-core";
import { models } from "./models";
import { projects } from "./projects";

export const projectModels = pgTable(
  "project_models",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id"),
    modelId: uuid("model_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.modelId],
      foreignColumns: [models.id],
      name: "project_models_model_id_fkey",
    }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "project_models_project_id_fkey",
    }),
    unique("project_models_project_id_model_id_key").on(
      table.projectId,
      table.modelId,
    ),
  ],
);

export const projectModelsRelations = relations(projectModels, ({ one }) => ({
  model: one(models, {
    fields: [projectModels.modelId],
    references: [models.id],
  }),
  project: one(projects, {
    fields: [projectModels.projectId],
    references: [projects.id],
  }),
}));
