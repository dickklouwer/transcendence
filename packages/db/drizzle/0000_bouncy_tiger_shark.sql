--> CREATE SCHEMA "pong";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "pong"."user_state" AS ENUM('Online', 'Offline', 'In-Game');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."friends" (
	"friend_id" serial PRIMARY KEY NOT NULL,
	"user_id_send" integer NOT NULL,
	"user_id_receive" integer NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."games" (
	"game_id" serial PRIMARY KEY NOT NULL,
	"player1_id" integer,
	"player2_id" integer,
	"player1_score" integer,
	"player2_score" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."group_chats" (
	"group_chat_id" serial PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"group_is_public" boolean DEFAULT false,
	"group_password" text,
	"group_image" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."group_chats_users" (
	"group_chat_user_id" serial PRIMARY KEY NOT NULL,
	"group_chat_id" integer,
	"intra_user_id" integer,
	"is_owner" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"mute_untill" timestamp,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."message_status" (
	"message_status_id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"receivet_at" timestamp,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer,
	"receiver_id" integer,
	"group_chat_id" integer,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."users" (
	"intra_user_id" integer PRIMARY KEY NOT NULL,
	"user_name" text NOT NULL,
	"nick_name" text,
	"token" text,
	"email" text NOT NULL,
	"password" text,
	"two_factor_secret" text,
	"is_two_factor_enabled" boolean DEFAULT false,
	"state" "pong"."user_state" DEFAULT 'Online' NOT NULL,
	"image_url" text NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_user_name_unique" UNIQUE("user_name"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."games" ADD CONSTRAINT "games_player1_id_users_intra_user_id_fk" FOREIGN KEY ("player1_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."games" ADD CONSTRAINT "games_player2_id_users_intra_user_id_fk" FOREIGN KEY ("player2_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."group_chats_users" ADD CONSTRAINT "group_chats_users_group_chat_id_group_chats_group_chat_id_fk" FOREIGN KEY ("group_chat_id") REFERENCES "pong"."group_chats"("group_chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."group_chats_users" ADD CONSTRAINT "group_chats_users_intra_user_id_users_intra_user_id_fk" FOREIGN KEY ("intra_user_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."message_status" ADD CONSTRAINT "message_status_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "pong"."messages"("message_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."message_status" ADD CONSTRAINT "message_status_receiver_id_users_intra_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messages" ADD CONSTRAINT "messages_sender_id_users_intra_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messages" ADD CONSTRAINT "messages_receiver_id_users_intra_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "pong"."users"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messages" ADD CONSTRAINT "messages_group_chat_id_group_chats_group_chat_id_fk" FOREIGN KEY ("group_chat_id") REFERENCES "pong"."group_chats"("group_chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
