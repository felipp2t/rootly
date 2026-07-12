CREATE TYPE "public"."activity_action" AS ENUM('folder_created', 'folder_deleted', 'item_created', 'item_updated', 'item_archived', 'item_restored', 'item_deleted');--> statement-breakpoint
CREATE TYPE "public"."activity_resource_type" AS ENUM('folder', 'item');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"resource_type" "activity_resource_type" NOT NULL,
	"resource_id" text NOT NULL,
	"resource_name" text NOT NULL,
	"action" "activity_action" NOT NULL,
	"actor_user_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;