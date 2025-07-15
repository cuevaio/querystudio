import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { projects } from "./projects";

export const projectsUsers = pgTable(
  "projects_users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    role: text(),
  },
  (table) => [
    index("projects_users_project_id_idx").using(
      "btree",
      table.projectId.asc().nullsLast().op("uuid_ops"),
    ),
    index("projects_users_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "projects_users_project_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_users_user_id_fkey",
    }).onDelete("cascade"),
    unique("projects_users_project_id_user_id_key").on(
      table.projectId,
      table.userId,
    ),
    pgPolicy("Users can manage their project access", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`(user_id = auth.uid())`,
    }),
    pgPolicy("Users can view their project access", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const projectsUsersRelations = relations(projectsUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectsUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectsUsers.userId],
    references: [users.id],
  }),
}));
