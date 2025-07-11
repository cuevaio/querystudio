import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { competitors } from "./competitors";
import { domains } from "./domains";
import { executions } from "./executions";
import { projectModels } from "./project_models";
import { projectsUsers } from "./projects_users";
import { queries } from "./queries";
import { sources } from "./sources";
import { topics } from "./topics";
import { users } from "./users";

export const projects = pgTable(
  "projects",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    slug: text("slug").unique().notNull(),
    description: text(),
    url: text(),
    status: boolean().default(true),
    region: text(),
    sector: text(),
    language: text("language"),
    lastAnalysis: date("last_analysis"),
    logo: text(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => ({
    projectsStatusIdx: index("projects_status_idx").using(
      "btree",
      table.status.asc().nullsLast(),
    ),
    projectsUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_user_id_fkey",
    }),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  projectsUsers: many(projectsUsers),
  queries: many(queries),
  topics: many(topics),
  competitors: many(competitors),
  executions: many(executions),
  sources: many(sources),
  domains: many(domains),
  projectModels: many(projectModels),
}));
