ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_action";--> statement-breakpoint
CREATE TYPE "public"."activity_action" AS ENUM('folder_created', 'folder_renamed', 'folder_deleted', 'item_created', 'item_updated', 'item_archived', 'item_restored', 'item_deleted', 'member_invited', 'member_joined', 'member_role_changed', 'member_removed', 'workspace_renamed');--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE "public"."activity_action" USING "action"::"public"."activity_action";