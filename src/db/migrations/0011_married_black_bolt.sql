ALTER TABLE "orders" ADD COLUMN "shipping_carrier" varchar(120);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(120);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_url" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_delivery_at" timestamp with time zone;