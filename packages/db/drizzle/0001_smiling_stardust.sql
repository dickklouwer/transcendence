ALTER TABLE "pong"."messageStatus" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pong"."messages" ADD COLUMN "invite_game" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messageStatus" ADD CONSTRAINT "messageStatus_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "pong"."chats"("chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
