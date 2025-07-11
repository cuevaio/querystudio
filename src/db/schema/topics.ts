import { relations } from "drizzle-orm";
import { foreignKey, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { queries } from "./queries";

export const topics = pgTable(
  "topics",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id"),
    name: text().notNull(),
    description: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "topics_project_id_fkey",
    }),
  ],
);

export const topicsRelations = relations(topics, ({ one, many }) => ({
  queries: many(queries),
  project: one(projects, {
    fields: [topics.projectId],
    references: [projects.id],
  }),
}));
