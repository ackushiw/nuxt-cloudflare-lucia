ALTER TABLE oauth_account ADD `google_access_token` text;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `hashed_password`;