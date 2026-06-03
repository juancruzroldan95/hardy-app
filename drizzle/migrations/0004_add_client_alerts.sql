CREATE TYPE "public"."alert_tipo" AS ENUM('reorder', 'payment', 'inactivity', 'custom');--> statement-breakpoint
CREATE TABLE "client_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"tipo" "alert_tipo" DEFAULT 'custom' NOT NULL,
	"mensaje" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_by_user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "client_alerts_profile_id_idx" ON "client_alerts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "client_alerts_is_resolved_idx" ON "client_alerts" USING btree ("is_resolved");