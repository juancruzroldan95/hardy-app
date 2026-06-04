ALTER TYPE "public"."user_role" ADD VALUE 'admin';--> statement-breakpoint
CREATE TABLE "novedades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"cuerpo" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cuit" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "vendedor_nombre" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "vendedor_whatsapp" text;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD COLUMN "notas_admin" text;--> statement-breakpoint
CREATE INDEX "novedades_created_at_idx" ON "novedades" USING btree ("created_at");