CREATE TABLE "query" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"topic_id" varchar(12) NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic" (
	"id" varchar(12) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "query" ADD CONSTRAINT "query_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;