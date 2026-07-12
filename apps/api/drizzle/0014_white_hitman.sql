ALTER TABLE "items" DROP CONSTRAINT "items_folder_id_fkey";
--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE restrict ON UPDATE no action;
z 