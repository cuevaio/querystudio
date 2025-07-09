ALTER TABLE "query" ADD COLUMN "organization_id" varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE "topic" ADD COLUMN "organization_id" varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE "query" ADD CONSTRAINT "query_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;