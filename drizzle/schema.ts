import { pgTable, index, uniqueIndex, foreignKey, uuid, text, unique, timestamp, pgPolicy, integer, boolean, date, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const domains = pgTable("domains", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	name: text().notNull(),
	category: text(),
}, (table) => [
	index("domains_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	uniqueIndex("domains_project_name_key").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "domains_project_id_fkey"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
	token: text().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}),
	unique("sessions_token_key").on(table.token),
]);

export const projectsUsers = pgTable("projects_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	role: text(),
}, (table) => [
	index("projects_users_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("projects_users_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "projects_users_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_users_user_id_fkey"
		}).onDelete("cascade"),
	unique("projects_users_project_id_user_id_key").on(table.projectId, table.userId),
	pgPolicy("Users can manage their project access", { as: "permissive", for: "all", to: ["public"], using: sql`(user_id = auth.uid())` }),
	pgPolicy("Users can view their project access", { as: "permissive", for: "select", to: ["public"] }),
]);

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const mentions = pgTable("mentions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceId: uuid("source_id"),
	competitorId: uuid("competitor_id"),
	mentionedAt: timestamp("mentioned_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.competitorId],
			foreignColumns: [competitors.id],
			name: "mentions_competitor_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceId],
			foreignColumns: [sources.id],
			name: "mentions_source_id_fkey"
		}).onDelete("cascade"),
	unique("mentions_source_id_competitor_id_key").on(table.sourceId, table.competitorId),
]);

export const competitors = pgTable("competitors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	name: text().notNull(),
	alternativeNames: text("alternative_names").array().default([""]),
	mentionCount: integer("mention_count").default(0),
	lastMentionDate: timestamp("last_mention_date", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("competitors_project_name_key").using("btree", table.projectId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "competitors_project_id_fkey"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	url: text(),
	status: boolean().default(true),
	region: text(),
	sector: text(),
	lastAnalysis: date("last_analysis"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
	logo: text(),
	userId: uuid("user_id").notNull(),
	language: text(),
	slug: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`),
}, (table) => [
	index("projects_status_idx").using("btree", table.status.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can delete projects they have access to", { as: "permissive", for: "delete", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM projects_users pu
  WHERE ((pu.project_id = projects.id) AND (pu.user_id = auth.uid()))))` }),
	pgPolicy("Users can insert projects", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update projects they have access to", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view projects they have access to", { as: "permissive", for: "select", to: ["public"] }),
]);

export const sources = pgTable("sources", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	domainId: uuid("domain_id"),
	projectId: uuid("project_id"),
	url: text().notNull(),
	title: text(),
	modelId: uuid("model_id"),
	mentions: text().array().default([""]),
	queryType: text("query_type").default('sector'),
	queryText: text("query_text"),
	queryExecutionId: uuid("query_execution_id"),
}, (table) => [
	index("idx_sources_mentions").using("gin", table.mentions.asc().nullsLast().op("array_ops")),
	index("idx_sources_query_type").using("btree", table.queryType.asc().nullsLast().op("text_ops")),
	uniqueIndex("sources_exec_url_key").using("btree", table.queryExecutionId.asc().nullsLast().op("text_ops"), table.url.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.domainId],
			foreignColumns: [domains.id],
			name: "sources_domain_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "sources_model_id_fkey"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "sources_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.queryExecutionId],
			foreignColumns: [queryExecutions.id],
			name: "sources_query_execution_id_fkey"
		}),
	check("check_query_type", sql`query_type = ANY (ARRAY['sector'::text, 'product'::text])`),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	emailVerified: boolean("email_verified").default(true).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
	pgPolicy("Users can insert own profile", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = id)`  }),
	pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view own profile", { as: "permissive", for: "select", to: ["public"] }),
]);

export const verifications = pgTable("verifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const queryExecutions = pgTable("query_executions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	executionId: uuid("execution_id"),
	queryId: uuid("query_id"),
	modelId: uuid("model_id"),
	response: text(),
	errorMessage: text("error_message"),
}, (table) => [
	foreignKey({
			columns: [table.executionId],
			foreignColumns: [executions.id],
			name: "query_executions_execution_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "query_executions_model_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.queryId],
			foreignColumns: [queries.id],
			name: "query_executions_query_id_fkey"
		}).onDelete("cascade"),
]);

export const queries = pgTable("queries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	topicId: uuid("topic_id"),
	text: text().notNull(),
	country: text(),
	active: boolean().default(true),
	queryType: text("query_type").default('sector').notNull(),
	projectId: uuid("project_id").notNull(),
}, (table) => [
	index("queries_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "queries_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [topics.id],
			name: "queries_topic_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("Users can create queries for their projects", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can delete queries for their projects", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Users can update queries for their projects", { as: "permissive", for: "update", to: ["public"] }),
]);

export const topics = pgTable("topics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	name: text().notNull(),
	description: text(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "topics_project_id_fkey"
		}).onDelete("cascade"),
]);

export const models = pgTable("models", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	model: text(),
	color: text(),
});

export const executions = pgTable("executions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	executedAt: timestamp("executed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "executions_project_id_fkey"
		}).onDelete("cascade"),
]);

export const projectModels = pgTable("project_models", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	modelId: uuid("model_id"),
}, (table) => [
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [models.id],
			name: "project_models_model_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_models_project_id_fkey"
		}).onDelete("cascade"),
	unique("project_models_project_id_model_id_key").on(table.projectId, table.modelId),
]);
