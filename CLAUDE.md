# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start Next.js development server
- `bun run build` - Build the application for production
- `bun run lint` - Run Next.js linting
- `bun run biome:check` - Run Biome linter and formatter with fixes

## Database Commands

- `bun run db:generate` - Generate Drizzle database migrations
- `bun run db:generate:auth` - Generate Better Auth database schema
- `bun run db:migrate` - Apply pending migrations
- `bun run db:push` - Push schema changes directly to database
- `bun run db:pull` - Pull schema from database

## Architecture Overview

This is a Next.js application using the App Router with a PostgreSQL database managed by Drizzle ORM. The application appears to be a query management and analysis platform.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password and GitHub OAuth
- **UI**: Radix UI components with Tailwind CSS
- **AI**: Multiple AI providers (Anthropic Claude, OpenAI ChatGPT) via AI SDK
- **Background Jobs**: Trigger.dev for async task execution
- **Code Quality**: Biome for linting and formatting

### Database Schema Structure

The database follows a project-centric model:

- **Projects** - Main entity representing organizations/companies being analyzed
- **Topics** - Subject areas within projects  
- **Queries** - Analysis questions within topics (can be "sector" or "product" type)
- **Query Executions** - Historical runs of queries with results
- **Users & Auth** - User management via Better Auth
- **Supporting entities**: Competitors, Domains, Sources, Mentions, Models

Key relationships:
- Projects have many Topics and Queries
- Topics belong to Projects and have many Queries  
- Queries belong to Projects and optionally to Topics
- Query Executions track the history of query runs

### File Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components including UI components and forms
- `src/db/schema/` - Drizzle database schema definitions
- `src/actions/` - Server actions for data mutations
- `src/hooks/` - Custom React hooks for state and AI completions
- `src/prompts/` - AI prompt templates
- `src/trigger/` - Background job definitions
- `src/auth/` - Better Auth configuration

### AI Integration

The app integrates multiple AI providers:
- Claude (Anthropic) via `/api/ai/chat/claude/`
- ChatGPT (OpenAI) via `/api/ai/chat/chatgpt/`
- AI completions for company analysis and topic generation

### Environment Setup

Requires `.env.local` with:
- `DATABASE_URL` for PostgreSQL connection
- GitHub OAuth credentials for authentication
- AI provider API keys

### Testing & Code Quality

Run `bun run biome:check` before committing to ensure code quality standards. The project uses Bun as the package manager and runtime, with Biome for both linting and formatting with specific rules for import organization and unused import detection.