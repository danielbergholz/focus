CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "tasks_title_length" CHECK(length(trim("tasks"."title")) between 1 and 200)
);
