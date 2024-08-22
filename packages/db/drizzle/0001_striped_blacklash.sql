ALTER TABLE "pong"."chats_users" RENAME TO "chatsUsers";--> statement-breakpoint
ALTER TABLE "pong"."message_status" RENAME TO "messageStatus";--> statement-breakpoint
ALTER TABLE "pong"."chatsUsers" DROP CONSTRAINT "chats_users_chat_id_chats_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "pong"."chatsUsers" DROP CONSTRAINT "chats_users_intra_user_id_users_intra_user_id_fk";
--> statement-breakpoint
ALTER TABLE "pong"."messageStatus" DROP CONSTRAINT "message_status_message_id_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "pong"."messageStatus" DROP CONSTRAINT "message_status_receiver_id_users_intra_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."chatsUsers" ADD CONSTRAINT "chatsUsers_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "pong"."chats"("chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."chatsUsers" ADD CONSTRAINT "chatsUsers_intra_user_id_users_intra_user_id_fk" FOREIGN KEY ("intra_user_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messageStatus" ADD CONSTRAINT "messageStatus_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "pong"."messages"("message_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messageStatus" ADD CONSTRAINT "messageStatus_receiver_id_users_intra_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
