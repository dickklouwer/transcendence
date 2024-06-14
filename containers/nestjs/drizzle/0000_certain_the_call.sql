CREATE SCHEMA "pong";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."message_state" AS ENUM('sent', 'delivered', 'read');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_state" AS ENUM('Online', 'Offline', 'In-Game', 'Idle');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."message_status" (
	"message_id" integer PRIMARY KEY NOT NULL,
	"user_id" integer,
	"status" "message_state" DEFAULT 'sent' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer,
	"reciever_id" integer,
	"group_chat_id" integer,
	"message" text NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."user_group_chats" (
	"group_chat_id" integer PRIMARY KEY NOT NULL,
	"intra_user_id" integer,
	"is_owner" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"mute_untill" timestamp DEFAULT null,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."friends" (
	"user_id_one" integer NOT NULL,
	"user_id_two" integer NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."group_chats" (
	"group_chat_id" serial PRIMARY KEY NOT NULL,
	"group_name" text NOT NULL,
	"group_password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pong"."user" (
	"intra_user_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text,
	"email" text NOT NULL,
	"state" "user_state" DEFAULT 'Online' NOT NULL,
	"image_url" text,
	CONSTRAINT "user_name_unique" UNIQUE("name"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."message_status" ADD CONSTRAINT "message_status_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "pong"."messages"("message_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."message_status" ADD CONSTRAINT "message_status_user_id_user_intra_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "pong"."user"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."messages" ADD CONSTRAINT "messages_sender_id_user_intra_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "pong"."user"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."user_group_chats" ADD CONSTRAINT "user_group_chats_group_chat_id_group_chats_group_chat_id_fk" FOREIGN KEY ("group_chat_id") REFERENCES "pong"."group_chats"("group_chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pong"."user_group_chats" ADD CONSTRAINT "user_group_chats_intra_user_id_user_intra_user_id_fk" FOREIGN KEY ("intra_user_id") REFERENCES "pong"."user"("intra_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
