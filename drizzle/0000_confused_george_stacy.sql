CREATE TYPE "public"."cell" AS ENUM('X', 'O', 'EMPTY');--> statement-breakpoint
CREATE TYPE "public"."player_move_type" AS ENUM('X', 'O');--> statement-breakpoint
CREATE TYPE "public"."session_role" AS ENUM('player', 'spectator');--> statement-breakpoint
CREATE TABLE "player" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"nick_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_player" (
	"room_id" varchar(255) NOT NULL,
	"player_id" varchar(255) NOT NULL,
	"mark" "player_move_type" NOT NULL,
	CONSTRAINT "room_player_room_id_player_id_pk" PRIMARY KEY("room_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "room_spectator" (
	"room_id" varchar(255) NOT NULL,
	"player_id" varchar(255) NOT NULL,
	CONSTRAINT "room_spectator_room_id_player_id_pk" PRIMARY KEY("room_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"board" "cell"[] DEFAULT '{"EMPTY","EMPTY","EMPTY","EMPTY","EMPTY","EMPTY","EMPTY","EMPTY","EMPTY"}' NOT NULL,
	"turn" "player_move_type" NOT NULL,
	"winner_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"player_id" varchar(255) NOT NULL,
	"room_id" varchar(255),
	"role" "session_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_player" ADD CONSTRAINT "room_player_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_player" ADD CONSTRAINT "room_player_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_spectator" ADD CONSTRAINT "room_spectator_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_spectator" ADD CONSTRAINT "room_spectator_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_winner_id_player_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE set null ON UPDATE no action;