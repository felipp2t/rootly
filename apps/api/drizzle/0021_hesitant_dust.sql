ALTER TYPE "public"."activity_action" ADD VALUE 'role_created';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'role_deleted';--> statement-breakpoint
ALTER TYPE "public"."activity_action" ADD VALUE 'role_permissions_changed';--> statement-breakpoint
ALTER TYPE "public"."activity_resource_type" ADD VALUE 'role';