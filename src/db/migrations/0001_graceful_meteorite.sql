CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(60) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"price_in_cop" integer NOT NULL,
	"requires_address" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_methods_price_non_negative" CHECK ("shipping_methods"."price_in_cop" >= 0),
	CONSTRAINT "shipping_methods_sort_order_non_negative" CHECK ("shipping_methods"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_methods_code_unique" ON "shipping_methods" USING btree ("code");