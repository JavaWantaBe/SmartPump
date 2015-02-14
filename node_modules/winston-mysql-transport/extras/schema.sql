CREATE TABLE IF NOT EXISTS `logs` (
	`id` int(10) NOT NULL AUTO_INCREMENT,
	`level` varchar(45) NOT NULL,
	`message` text NOT NULL,
	`timestamp` datetime NOT NULL,
	`meta` varchar(255),
	`hostname` varchar(255),
	PRIMARY KEY (`id`)
);