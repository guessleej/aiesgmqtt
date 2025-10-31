CREATE TABLE `airQualityRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` varchar(255) NOT NULL,
	`co2` int NOT NULL,
	`pm25` int,
	`pm10` int,
	`temperature` int,
	`humidity` int,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `airQualityRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carbonEmissionRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(255) NOT NULL,
	`emissionType` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`calculationMethod` text,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carbonEmissionRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `electricityRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`consumption` int NOT NULL,
	`cost` int,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `electricityRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `powerDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(64) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceType` varchar(64) NOT NULL,
	`location` varchar(255),
	`status` enum('on','off','offline') NOT NULL DEFAULT 'off',
	`powerRating` int,
	`mqttTopic` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `powerDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `powerDevices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `waterRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` varchar(255) NOT NULL,
	`consumption` int NOT NULL,
	`cost` int,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waterRecords_id` PRIMARY KEY(`id`)
);
