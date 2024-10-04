ALTER TABLE "pong"."messageStatus" DROP CONSTRAINT "messageStatus_chat_id_users_intra_user_id_fk";
--> statement-breakpoint
ALTER TABLE "pong"."messageStatus" ALTER COLUMN "chat_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pong"."messageStatus" ADD COLUMN "receiver_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messageStatus" ADD CONSTRAINT "messageStatus_receiver_id_users_intra_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
