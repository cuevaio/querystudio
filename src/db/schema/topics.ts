import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { query } from "./query";

export const topic = pgTable("topic", {
  id: varchar("id", { length: 12 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 12 })
    .references(() => organization.id, { onDelete: "cascade" })
    .notNull(),

  name: text("name").notNull(),
  description: text("description").notNull(),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const topicRelations = relations(topic, ({ many, one }) => ({
  queries: many(query),
  organization: one(organization, {
    fields: [topic.organizationId],
    references: [organization.id],
  }),
}));

export type TopicInsert = typeof topic.$inferInsert;
