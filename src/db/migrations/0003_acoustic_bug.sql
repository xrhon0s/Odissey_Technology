CREATE TYPE "public"."payment_method" AS ENUM('manual_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'declined', 'voided', 'refunded');--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"event_type" varchar(60) NOT NULL,
	"external_event_id" varchar(160),
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"reference" varchar(48) NOT NULL,
	"method" "payment_method" DEFAULT 'manual_transfer' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_in_cop" integer NOT NULL,
	"proof_url" text,
	"review_notes" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount_in_cop" > 0),
	CONSTRAINT "payments_approved_at_consistent" CHECK (("payments"."status" = 'approved' and "payments"."approved_at" is not null) or ("payments"."status" <> 'approved' and "payments"."approved_at" is null))
);
--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_events_payment_created_idx" ON "payment_events" USING btree ("payment_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_external_event_unique" ON "payment_events" USING btree ("external_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_order_unique" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_reference_unique" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "payments_status_created_idx" ON "payments" USING btree ("status","created_at");--> statement-breakpoint
INSERT INTO "payments" ("order_id", "reference", "amount_in_cop")
SELECT "id", 'PM-' || "reference", "total_in_cop"
FROM "orders"
ON CONFLICT ("order_id") DO NOTHING;--> statement-breakpoint
INSERT INTO "payment_events" ("payment_id", "event_type", "payload")
SELECT "id", 'created', '{"method":"manual_transfer","status":"pending"}'::jsonb
FROM "payments"
WHERE NOT EXISTS (
	SELECT 1
	FROM "payment_events"
	WHERE "payment_events"."payment_id" = "payments"."id"
);
