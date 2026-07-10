CREATE TABLE `news_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enabledCategories` text NOT NULL DEFAULT ('["ai","quantum","it","security","space","tech"]'),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_preferences_userId_unique` UNIQUE(`userId`)
);
