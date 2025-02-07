CREATE TABLE IF NOT EXISTS "pong"."blocks" (
	"block_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"blocked_user_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."blocks" ADD CONSTRAINT "blocks_user_id_users_intra_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."blocks" ADD CONSTRAINT "blocks_blocked_user_id_users_intra_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
