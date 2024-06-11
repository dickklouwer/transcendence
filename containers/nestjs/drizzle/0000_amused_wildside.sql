CREATE SCHEMA "pong";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image_url" text,
	CONSTRAINT "user_name_unique" UNIQUE("name"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
