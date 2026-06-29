DROP TABLE "item_tags" CASCADE;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "slug" text NOT NULL;