import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { query } from "./query";
import { topic } from "./topics";

export const organization = pgTable("organization", {
  id: varchar("id", { length: 12 }).primaryKey(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  websiteUrl: text("website_url").notNull(),
  sector: text("sector").notNull(),
  country: text("country").notNull(),
  language: text("language").notNull(),
  description: text("description").notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const membershipRole = pgEnum("membership_role", ["admin", "member"]);

export const membership = pgTable(
  "membership",
  {
    organizationId: varchar("organization_id", { length: 12 })
      .references(() => organization.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, {
        onDelete: "cascade",
      })
      .notNull(),
    role: membershipRole("role").notNull(),

    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.organizationId, t.userId] })],
);

export const organizationRelations = relations(organization, ({ many }) => ({
  memberships: many(membership),
  topics: many(topic),
  queries: many(query),
}));

export const membershipRelations = relations(membership, ({ one }) => ({
  organization: one(organization, {
    fields: [membership.organizationId],
    references: [organization.id],
  }),
}));
