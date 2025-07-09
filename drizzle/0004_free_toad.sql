ALTER TABLE "topic" DROP CONSTRAINT "topic_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;