import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { topic } from "./topics";

export const queryType = pgEnum("query_type", ["market", "brand"]);

export const query = pgTable("query", {
  id: varchar("id", { length: 12 }).primaryKey(),

  content: text("content").notNull(),

  isActive: boolean("is_active").notNull().default(true),

  queryType: queryType("query_type").notNull(),

  topicId: varchar("topic_id", { length: 12 })
    .references(() => topic.id, {
      onDelete: "cascade",
    })
    .notNull(),
  organizationId: varchar("organization_id", { length: 12 })
    .references(() => organization.id, {
      onDelete: "cascade",
    })
    .notNull(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const queryRelations = relations(query, ({ one }) => ({
  topic: one(topic, {
    fields: [query.topicId],
    references: [topic.id],
  }),
  organization: one(organization, {
    fields: [query.organizationId],
    references: [organization.id],
  }),
}));

export type QueryInsert = typeof query.$inferInsert;
