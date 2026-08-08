ALTER TYPE "public"."payment_method" ADD VALUE 'nequi';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'daviplata';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'bancolombia_transfer';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'cash_on_delivery';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" DROP DEFAULT;