ALTER TABLE "pong"."messageStatus" RENAME COLUMN "receiver_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "pong"."messageStatus" DROP CONSTRAINT "messageStatus_receiver_id_users_intra_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messageStatus" ADD CONSTRAINT "messageStatus_chat_id_users_intra_user_id_fk" FOREIGN KEY ("chat_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
