ALTER TABLE "pong"."friends" ADD COLUMN "invite_game" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pong"."messages" DROP COLUMN IF EXISTS "invite_game";