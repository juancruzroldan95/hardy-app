CREATE TABLE "costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept" text NOT NULL,
	"category" text,
	"amount_ars" numeric(12, 2) NOT NULL,
	"cost_date" text NOT NULL,
	"notes" text,
	"created_by_user_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "channel" text DEFAULT 'b2b';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_cp" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "andreani_nro_envio" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_email" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "guest_phone" text;--> statement-breakpoint
ALTER TABLE "product_availability" ADD COLUMN "stock_qty" integer;--> statement-breakpoint
CREATE INDEX "costs_cost_date_idx" ON "costs" USING btree ("cost_date");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_guest_email_idx" ON "orders" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "orders_channel_idx" ON "orders" USING btree ("channel");