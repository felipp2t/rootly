DROP TABLE "folder_tags" CASCADE;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "resource" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."permission_resource";--> statement-breakpoint
CREATE TYPE "public"."permission_resource" AS ENUM('workspace', 'folder', 'item', 'member', 'role');--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "resource" SET DATA TYPE "public"."permission_resource" USING "resource"::"public"."permission_resource";--> statement-breakpoint
DROP TYPE "public"."tag_color";