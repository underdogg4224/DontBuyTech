ALTER TABLE "deals" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "ai_quality_score" integer;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "summarized_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "archive_reason" varchar(50);--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "ranking_metadata" jsonb;--> statement-breakpoint
CREATE INDEX "deals_archived_at_idx" ON "deals" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "deals_ai_quality_score_idx" ON "deals" USING btree ("ai_quality_score");--> statement-breakpoint
CREATE INDEX "deals_ai_ranking_idx" ON "deals" USING btree ("ai_quality_score","created_at","votes_count");