CREATE TABLE "request_rate_limits" (
	"count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"identity_hash" varchar(64) NOT NULL,
	"scope" varchar(60) NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	CONSTRAINT "request_rate_limits_pk" PRIMARY KEY("scope","identity_hash","window_started_at"),
	CONSTRAINT "request_rate_limits_count_positive" CHECK ("request_rate_limits"."count" > 0)
);
--> statement-breakpoint
CREATE INDEX "request_rate_limits_expiry_idx" ON "request_rate_limits" USING btree ("expires_at");