CREATE TYPE "public"."estado_solicitud" AS ENUM('pendiente', 'contactado', 'aprobada', 'rechazada');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('transferencia', 'efectivo', 'credito30', 'credito60', 'cheque');--> statement-breakpoint
CREATE TYPE "public"."shipping_method" AS ENUM('coordinar_whatsapp', 'andreani', 'oca', 'retiro_deposito');--> statement-breakpoint
CREATE TYPE "public"."tipo_negocio" AS ENUM('dietetica', 'suplementos', 'distribuidor', 'cafeteria', 'restaurante', 'gimnasio', 'almacen', 'otro');--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"empresa" text NOT NULL,
	"tipo_negocio" "tipo_negocio" NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"ciudad" text NOT NULL,
	"provincia" text NOT NULL,
	"cuit" text,
	"mensaje" text,
	"estado" "estado_solicitud" DEFAULT 'pendiente' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_method" "shipping_method";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_method";--> statement-breakpoint
CREATE INDEX "solicitudes_estado_idx" ON "solicitudes" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "solicitudes_email_idx" ON "solicitudes" USING btree ("email");