import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { mentions } from "./mentions";
import { projects } from "./projects";

export const competitors = pgTable(
  "competitors",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id"),
    name: text().notNull(),
    alternativeNames: text("alternative_names").array().default([""]),
    mentionCount: integer("mention_count").default(0),
    lastMentionDate: timestamp("last_mention_date", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => ({
    competitorsProjectNameKey: uniqueIndex(
      "competitors_project_name_key",
    ).using(
      "btree",
      table.projectId.asc().nullsLast(),
      table.name.asc().nullsLast(),
    ),
    competitorsProjectIdFkey: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "competitors_project_id_fkey",
    }),
  }),
);

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  project: one(projects, {
    fields: [competitors.projectId],
    references: [projects.id],
  }),
  mentions: many(mentions),
}));
