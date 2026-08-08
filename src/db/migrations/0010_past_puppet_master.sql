ALTER TABLE "store_settings" ADD COLUMN "nequi_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "nequi_number" varchar(20) DEFAULT '3126485885';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "nequi_key" varchar(80) DEFAULT '@NEQUIDAV5700';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "bancolombia_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "bancolombia_account_number" varchar(30) DEFAULT '23652931391';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "bancolombia_key" varchar(80) DEFAULT '@davids700';--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "daviplata_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "store_settings" ADD COLUMN "cash_on_delivery_enabled" boolean DEFAULT true NOT NULL;