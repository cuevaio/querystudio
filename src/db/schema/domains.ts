import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { sources } from "./sources";

export const domains = pgTable(
  "domains",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id"),
    name: text().notNull(),
    category: text(),
  },
  (table) => ({
    domainsCategoryIdx: index("domains_category_idx").using(
      "btree",
      table.category.asc().nullsLast(),
    ),
    domainsProjectNameKey: uniqueIndex("domains_project_name_key").using(
      "btree",
      table.projectId.asc().nullsLast(),
      table.name.asc().nullsLast(),
    ),
    domainsProjectIdFkey: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "domains_project_id_fkey",
    }),
  }),
);

export const domainsRelations = relations(domains, ({ one, many }) => ({
  sources: many(sources),
  project: one(projects, {
    fields: [domains.projectId],
    references: [projects.id],
  }),
}));
