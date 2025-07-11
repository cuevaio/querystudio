import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const projectsUsers = pgTable(
  "projects_users",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`timezone('utc'::text, now())`)
      .notNull(),
  },
  (table) => ({
    projectsUsersProjectIdFkey: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "projects_users_project_id_fkey",
    }),
    projectsUsersUserIdFkey: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "projects_users_user_id_fkey",
    }),
  }),
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
