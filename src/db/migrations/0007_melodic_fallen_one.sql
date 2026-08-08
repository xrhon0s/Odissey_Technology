ALTER TABLE "product_images" RENAME COLUMN "cloudinary_public_id" TO "storage_path";--> statement-breakpoint
DROP INDEX "product_images_cloudinary_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_storage_path_unique" ON "product_images" USING btree ("storage_path");