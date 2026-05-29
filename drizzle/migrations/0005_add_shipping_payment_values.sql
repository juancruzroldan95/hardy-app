ALTER TYPE "public"."payment_method" ADD VALUE 'deposito_bancario';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE 'echeq_30';--> statement-breakpoint
ALTER TYPE "public"."shipping_method" ADD VALUE 'urgente_caba';--> statement-breakpoint
ALTER TYPE "public"."shipping_method" ADD VALUE 'urgente_gba';--> statement-breakpoint
ALTER TYPE "public"."shipping_method" ADD VALUE 'sin_urgencia_caba';--> statement-breakpoint
ALTER TYPE "public"."shipping_method" ADD VALUE 'sin_urgencia_gba';