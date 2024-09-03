ALTER TABLE "pong"."messages" DROP CONSTRAINT "messages_receiver_id_users_intra_user_id_fk";
--> statement-breakpoint
ALTER TABLE "pong"."messages" ALTER COLUMN "sender_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pong"."messages" ALTER COLUMN "chat_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pong"."messages" DROP COLUMN IF EXISTS "receiver_id";