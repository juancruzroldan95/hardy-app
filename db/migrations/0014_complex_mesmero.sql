ALTER TABLE "orders" ALTER COLUMN "shipping_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_custom_order" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DROP TYPE "public"."shipping_method";