CREATE TYPE "public"."query_type" AS ENUM('market', 'brand');--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "query" ADD COLUMN "type" "query_type" NOT NULL;