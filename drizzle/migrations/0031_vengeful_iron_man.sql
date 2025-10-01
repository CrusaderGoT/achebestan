CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		"user_id" text NOT NULL,
		"endpoint" text NOT NULL,
		"user_agent" text,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"updated_at" timestamp DEFAULT now() NOT NULL,
		"p256dh" text NOT NULL,
		"auth" text NOT NULL,
		CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
	);
	--> statement-breakpoint
	DO $$
	BEGIN
		IF NOT EXISTS (
			SELECT 1
			FROM pg_constraint c
			JOIN pg_class t ON c.conrelid = t.oid
			JOIN pg_namespace n ON t.relnamespace = n.oid
			WHERE c.conname = 'push_subscriptions_user_id_user_id_fk'
			  AND n.nspname = 'public'
			  AND t.relname = 'push_subscriptions'
		) THEN
			EXECUTE 'ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action';
		END IF;
	END
	$$;