CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_name" varchar(180) NOT NULL,
	"variant_name" varchar(160) NOT NULL,
	"sku" varchar(80) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_in_cop" integer NOT NULL,
	"line_total_in_cop" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_unit_price_non_negative" CHECK ("order_items"."unit_price_in_cop" >= 0),
	CONSTRAINT "order_items_line_total_matches" CHECK ("order_items"."line_total_in_cop" = "order_items"."unit_price_in_cop" * "order_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(40) NOT NULL,
	"checkout_attempt_id" uuid NOT NULL,
	"request_fingerprint" varchar(64) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"customer_name" varchar(120) NOT NULL,
	"customer_email" varchar(254) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"address_snapshot" jsonb,
	"shipping_method_code" varchar(60) NOT NULL,
	"shipping_method_name" varchar(120) NOT NULL,
	"subtotal_in_cop" integer NOT NULL,
	"shipping_in_cop" integer NOT NULL,
	"total_in_cop" integer NOT NULL,
	"reservation_expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_subtotal_non_negative" CHECK ("orders"."subtotal_in_cop" >= 0),
	CONSTRAINT "orders_shipping_non_negative" CHECK ("orders"."shipping_in_cop" >= 0),
	CONSTRAINT "orders_total_non_negative" CHECK ("orders"."total_in_cop" >= 0),
	CONSTRAINT "orders_total_matches_components" CHECK ("orders"."total_in_cop" = "orders"."subtotal_in_cop" + "orders"."shipping_in_cop")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_order_variant_unique" ON "order_items" USING btree ("order_id","variant_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_reference_unique" ON "orders" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_checkout_attempt_unique" ON "orders" USING btree ("checkout_attempt_id");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_email_created_idx" ON "orders" USING btree ("customer_email","created_at");