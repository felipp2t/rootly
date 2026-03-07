ALTER TABLE "items" DROP CONSTRAINT "items_folder_id_fkey";
--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "folder_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;