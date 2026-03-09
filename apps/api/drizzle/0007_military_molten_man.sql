CREATE TYPE "public"."workspace_invites_status" AS ENUM('pending', 'accepted', 'declined', 'revoked');--> statement-breakpoint
CREATE TABLE "workspace_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"invited_user_id" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"pending" "workspace_invites_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspaces_invites_workspace_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspaces_invites_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspaces_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspaces_invites_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."workspace_roles"("id") ON DELETE no action ON UPDATE no action;