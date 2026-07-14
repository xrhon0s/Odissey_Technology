CREATE TYPE "public"."admin_role" AS ENUM('owner', 'admin');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_events" ADD COLUMN "actor_admin_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_admin_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_actor_admin_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE restrict ON UPDATE no action;