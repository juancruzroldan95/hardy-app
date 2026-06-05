CREATE TABLE IF NOT EXISTS "costs" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "concept"             text NOT NULL,
  "category"            text,
  "amount_ars"          numeric(12, 2) NOT NULL,
  "cost_date"           text NOT NULL,
  "notes"               text,
  "created_by_user_id"  uuid,
  "is_active"           boolean DEFAULT true NOT NULL,
  "is_deleted"          boolean DEFAULT false NOT NULL,
  "created_at"          timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"          timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "costs_cost_date_idx" ON "costs" ("cost_date");
