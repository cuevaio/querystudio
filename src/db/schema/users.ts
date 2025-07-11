import { relations } from "drizzle-orm";
import { index, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { projectsUsers } from "./projects_users";

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
  },
  (table) => ({
    usersEmailIdx: index("users_email_idx").using(
      "btree",
      table.email.asc().nullsLast(),
    ),
    usersEmailKey: unique("users_email_key").on(table.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  projectsUsers: many(projectsUsers),
}));
