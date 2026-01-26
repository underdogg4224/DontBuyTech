CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"icon" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"discount_percentage" integer,
	"url" varchar(1000) NOT NULL,
	"image_url" varchar(1000),
	"category_id" uuid NOT NULL,
	"brand" varchar(255),
	"score" real DEFAULT 0 NOT NULL,
	"votes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"archived" boolean DEFAULT false NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"vote_type" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_deal_vote" UNIQUE("deal_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "deals_category_id_idx" ON "deals" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "deals_archived_idx" ON "deals" USING btree ("archived");--> statement-breakpoint
CREATE INDEX "deals_score_idx" ON "deals" USING btree ("score");--> statement-breakpoint
CREATE INDEX "deals_created_at_idx" ON "deals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deals_active_category_score_idx" ON "deals" USING btree ("archived","category_id","score");--> statement-breakpoint
CREATE INDEX "votes_deal_id_idx" ON "votes" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "votes_user_id_idx" ON "votes" USING btree ("user_id");