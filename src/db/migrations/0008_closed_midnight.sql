CREATE TABLE "store_settings" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"store_name" varchar(120) DEFAULT 'Odissey Technology' NOT NULL,
	"announcement" varchar(180) DEFAULT 'Envíos a toda Colombia' NOT NULL,
	"support_email" varchar(254),
	"whatsapp_number" varchar(15),
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"updated_by_admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_updated_by_admin_id_admin_users_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;