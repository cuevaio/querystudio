import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { competitors } from "./competitors";
import { domains } from "./domains";
import { executions } from "./executions";
import { projectModels } from "./project_models";
import { projectsUsers } from "./projects_users";
import { queries } from "./queries";
import { sources } from "./sources";
import { topics } from "./topics";

export const projects = pgTable(
  "projects",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    url: text(),
    status: boolean().default(true),
    region: text(),
    sector: text(),
    lastAnalysis: date("last_analysis"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
    logo: text(),
    userId: uuid("user_id").notNull(),
    language: text(),
    slug: text(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
  },
  (table) => [
    index("projects_status_idx").using(
      "btree",
      table.status.asc().nullsLast().op("bool_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_user_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("Users can delete projects they have access to", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM projects_users pu
  WHERE ((pu.project_id = projects.id) AND (pu.user_id = auth.uid()))))`,
    }),
    pgPolicy("Users can insert projects", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update projects they have access to", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can view projects they have access to", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  domains: many(domains),
  projectsUsers: many(projectsUsers),
  competitors: many(competitors),
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  sources: many(sources),
  queries: many(queries),
  topics: many(topics),
  executions: many(executions),
  projectModels: many(projectModels),
}));
