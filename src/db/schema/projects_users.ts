import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
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
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "projects_users_project_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_users_user_id_fkey",
    }),
    unique("projects_users_project_id_user_id_key").on(
      table.projectId,
      table.userId,
    ),
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
