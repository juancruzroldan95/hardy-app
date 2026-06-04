ALTER TABLE "client_alerts" ADD COLUMN "scheduled_for" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_alerts" ADD COLUMN "email_sent_at" timestamp with time zone;