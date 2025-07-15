import { relations } from "drizzle-orm/relations";
import { projects, domains, users, sessions, projectsUsers, accounts, competitors, mentions, sources, models, queryExecutions, executions, queries, topics, projectModels } from "./schema";

export const domainsRelations = relations(domains, ({one, many}) => ({
	project: one(projects, {
		fields: [domains.projectId],
		references: [projects.id]
	}),
	sources: many(sources),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	domains: many(domains),
	projectsUsers: many(projectsUsers),
	competitors: many(competitors),
	user: one(users, {
		fields: [projects.userId],
		references: [users.id]
	}),
	sources: many(sources),
	queries: many(queries),
	topics: many(topics),
	executions: many(executions),
	projectModels: many(projectModels),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessions: many(sessions),
	projectsUsers: many(projectsUsers),
	accounts: many(accounts),
	projects: many(projects),
}));

export const projectsUsersRelations = relations(projectsUsers, ({one}) => ({
	project: one(projects, {
		fields: [projectsUsers.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectsUsers.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const mentionsRelations = relations(mentions, ({one}) => ({
	competitor: one(competitors, {
		fields: [mentions.competitorId],
		references: [competitors.id]
	}),
	source: one(sources, {
		fields: [mentions.sourceId],
		references: [sources.id]
	}),
}));

export const competitorsRelations = relations(competitors, ({one, many}) => ({
	mentions: many(mentions),
	project: one(projects, {
		fields: [competitors.projectId],
		references: [projects.id]
	}),
}));

export const sourcesRelations = relations(sources, ({one, many}) => ({
	mentions: many(mentions),
	domain: one(domains, {
		fields: [sources.domainId],
		references: [domains.id]
	}),
	model: one(models, {
		fields: [sources.modelId],
		references: [models.id]
	}),
	project: one(projects, {
		fields: [sources.projectId],
		references: [projects.id]
	}),
	queryExecution: one(queryExecutions, {
		fields: [sources.queryExecutionId],
		references: [queryExecutions.id]
	}),
}));

export const modelsRelations = relations(models, ({many}) => ({
	sources: many(sources),
	queryExecutions: many(queryExecutions),
	projectModels: many(projectModels),
}));

export const queryExecutionsRelations = relations(queryExecutions, ({one, many}) => ({
	sources: many(sources),
	execution: one(executions, {
		fields: [queryExecutions.executionId],
		references: [executions.id]
	}),
	model: one(models, {
		fields: [queryExecutions.modelId],
		references: [models.id]
	}),
	query: one(queries, {
		fields: [queryExecutions.queryId],
		references: [queries.id]
	}),
}));

export const executionsRelations = relations(executions, ({one, many}) => ({
	queryExecutions: many(queryExecutions),
	project: one(projects, {
		fields: [executions.projectId],
		references: [projects.id]
	}),
}));

export const queriesRelations = relations(queries, ({one, many}) => ({
	queryExecutions: many(queryExecutions),
	project: one(projects, {
		fields: [queries.projectId],
		references: [projects.id]
	}),
	topic: one(topics, {
		fields: [queries.topicId],
		references: [topics.id]
	}),
}));

export const topicsRelations = relations(topics, ({one, many}) => ({
	queries: many(queries),
	project: one(projects, {
		fields: [topics.projectId],
		references: [projects.id]
	}),
}));

export const projectModelsRelations = relations(projectModels, ({one}) => ({
	model: one(models, {
		fields: [projectModels.modelId],
		references: [models.id]
	}),
	project: one(projects, {
		fields: [projectModels.projectId],
		references: [projects.id]
	}),
}));