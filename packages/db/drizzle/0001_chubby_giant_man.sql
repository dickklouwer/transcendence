ALTER TABLE "pong"."friends" ALTER COLUMN "user_id_receive" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."friends" ADD CONSTRAINT "friends_user_id_send_users_intra_user_id_fk" FOREIGN KEY ("user_id_send") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."friends" ADD CONSTRAINT "friends_user_id_receive_users_intra_user_id_fk" FOREIGN KEY ("user_id_receive") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
