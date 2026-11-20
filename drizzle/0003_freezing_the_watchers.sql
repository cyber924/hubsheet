CREATE TABLE `product_image_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`set_id` text NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`raw_path` text,
	`image_json` text,
	`error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
