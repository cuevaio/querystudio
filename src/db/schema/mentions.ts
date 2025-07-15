import { relations } from "drizzle-orm";
import {
  foreignKey,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { competitors } from "./competitors";
import { sources } from "./sources";

export const mentions = pgTable(
  "mentions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    sourceId: uuid("source_id"),
    competitorId: uuid("competitor_id"),
    mentionedAt: timestamp("mentioned_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.competitorId],
      foreignColumns: [competitors.id],
      name: "mentions_competitor_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sourceId],
      foreignColumns: [sources.id],
      name: "mentions_source_id_fkey",
    }).onDelete("cascade"),
    unique("mentions_source_id_competitor_id_key").on(
      table.sourceId,
      table.competitorId,
    ),
  ],
);

export const mentionsRelations = relations(mentions, ({ one }) => ({
  competitor: one(competitors, {
    fields: [mentions.competitorId],
    references: [competitors.id],
  }),
  source: one(sources, {
    fields: [mentions.sourceId],
    references: [sources.id],
  }),
}));
