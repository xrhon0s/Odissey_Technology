ALTER TABLE "orders" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "terms_version" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "privacy_policy_version" varchar(20);--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "legal_name" varchar(160);--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "tax_id" varchar(30);--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "notification_address" varchar(240);--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "business_city" varchar(120);