-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema smartpump
-- -----------------------------------------------------
-- Database to hold all pump.
DROP SCHEMA IF EXISTS `smartpump` ;

-- -----------------------------------------------------
-- Schema smartpump
--
-- Database to hold all pump.
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `smartpump` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `smartpump` ;

-- -----------------------------------------------------
-- Table `smartpump`.`tide`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smartpump`.`tide` ;

CREATE TABLE IF NOT EXISTS `smartpump`.`tide` (
  `tide_time` TIMESTAMP NOT NULL COMMENT 'MySQL converts TIMESTAMP values from the current time zone to UTC for storage, and back from UTC to the current time zone for retrieval. (This does not occur for other types such as DATETIME.) By default, the current time zone for each connection is the s' /* comment truncated */ /*erver's time. The time zone can be set on a per-connection basis. As long as the time zone setting remains constant, you get back the same value you store. If you store a TIMESTAMP value, and then change the time zone and retrieve the value, the retrieved value is different from the value you stored.*/,
  `data_download_date` DATETIME NOT NULL,
  PRIMARY KEY (`tide_time`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `smartpump`.`pump_cycle`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smartpump`.`pump_cycle` ;

CREATE TABLE IF NOT EXISTS `smartpump`.`pump_cycle` (
  `idpump_cycles` INT NOT NULL AUTO_INCREMENT,
  `pump_used` ENUM('pump1','pump2') NOT NULL,
  `avg_gpm` SMALLINT NOT NULL,
  `total_gallons` MEDIUMINT NOT NULL,
  `total_pumping_time` TIME NOT NULL,
  `tide_tide_time` TIMESTAMP NOT NULL,
  PRIMARY KEY (`idpump_cycles`),
  INDEX `fk_pump_cycle_tide1_idx` (`tide_tide_time` ASC),
  CONSTRAINT `fk_pump_cycle_tide1`
    FOREIGN KEY (`tide_tide_time`)
    REFERENCES `smartpump`.`tide` (`tide_time`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `smartpump`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smartpump`.`user` ;

CREATE TABLE IF NOT EXISTS `smartpump`.`user` (
  `iduser` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(16) NOT NULL,
  `email` VARCHAR(255) NULL,
  `password` VARCHAR(32) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`iduser`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `smartpump`.`log`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smartpump`.`log` ;

CREATE TABLE IF NOT EXISTS `smartpump`.`log` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `level` VARCHAR(45) NOT NULL COMMENT 'Types available are:\ninfo\nwarn\nerror\n\nThese reflect the type of error to be logged.',
  `message` TEXT NOT NULL,
  `timestamp` DATETIME NOT NULL COMMENT 'Time of log message',
  `meta` VARCHAR(255) NULL COMMENT 'Which module the log message is coming from.',
  `hostname` VARCHAR(255) NULL,
  `user_iduser` INT NULL,
  `pump_cycle_idpump_cycles` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_log_user_idx` (`user_iduser` ASC),
  INDEX `fk_log_pump_cycle1_idx` (`pump_cycle_idpump_cycles` ASC),
  CONSTRAINT `fk_log_user`
    FOREIGN KEY (`user_iduser`)
    REFERENCES `smartpump`.`user` (`iduser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_log_pump_cycle1`
    FOREIGN KEY (`pump_cycle_idpump_cycles`)
    REFERENCES `smartpump`.`pump_cycle` (`idpump_cycles`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Used for logging all system messages.';


-- -----------------------------------------------------
-- Table `smartpump`.`tSystem`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smartpump`.`tSystem` ;

CREATE TABLE IF NOT EXISTS `smartpump`.`tSystem` (
  `system_start` DATETIME NOT NULL,
  `version` FLOAT NOT NULL)
ENGINE = MEMORY
COMMENT = 'Temporary variables and system info.  Used to minimize flash' /* comment truncated */ /* writes.*/;

USE `smartpump` ;

-- -----------------------------------------------------
-- function totalPumpingVolume
-- -----------------------------------------------------

USE `smartpump`;
DROP function IF EXISTS `smartpump`.`totalPumpingVolume`;

DELIMITER $$
USE `smartpump`$$


CREATE FUNCTION totalPumpingVolume() 
	RETURNS INT UNSIGNED
BEGIN 
	DECLARE totalVolume INT UNSIGNED;
	SET totalVolume = ( SELECT SUM( pump_cycle.total_gallons )
						FROM smartpump.pump_cycle );
	IF totalVolume IS NULL THEN set totalVolume = 0;
	END IF;
	RETURN totalVolume;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- function errorCount
-- -----------------------------------------------------

USE `smartpump`;
DROP function IF EXISTS `smartpump`.`errorCount`;

DELIMITER $$
USE `smartpump`$$
CREATE FUNCTION errorCount()
	RETURNS SMALLINT UNSIGNED
BEGIN 
    DECLARE eCount SMALLINT UNSIGNED;
	
	set eCount = ( SELECT COUNT(*) FROM smartpump.log WHERE logType = 'error' );
	
	IF eCOUNT IS NULL THEN SET eCount = 0;
	END IF;
	
	RETURN eCount;	
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure getUptime
-- -----------------------------------------------------

USE `smartpump`;
DROP procedure IF EXISTS `smartpump`.`getUptime`;

DELIMITER $$
USE `smartpump`$$
CREATE PROCEDURE getUptime()

BEGIN
	DECLARE uSec INT;
	DECLARE uMin  TINYINT UNSIGNED;
	DECLARE uHour TINYINT UNSIGNED;
	DECLARE uDay  SMALLINT UNSIGNED;
		
	SET uSec  = ( SELECT VARIABLE_VALUE FROM INFORMATION_SCHEMA.GLOBAL_STATUS WHERE VARIABLE_NAME='UPTIME' );
	-- Get number of days system has been up
	SET uDay  = uSec / 86400;
	-- Get number of days
	SET uHour = ( uSec - ( uDay * 86400 ) ) / 3600;
	-- Get minutes
	SET uMin = ( uSec - ( ( uDay * 86400 ) + ( uHour * 3600 ) ) ) / 60;
		
	SELECT uDay AS 'Days', uHour AS 'Hours', uMin AS 'Minutes';

END$$

DELIMITER ;

-- -----------------------------------------------------
-- function getLastDownload
-- -----------------------------------------------------

USE `smartpump`;
DROP function IF EXISTS `smartpump`.`getLastDownload`;

DELIMITER $$
USE `smartpump`$$


CREATE FUNCTION getLastDownload() 
	RETURNS TIMESTAMP 
BEGIN 
	DECLARE lastDownload TIMESTAMP; 
	SET lastDownload = ( SELECT data_download_date FROM tide ORDER BY data_download_date DESC LIMIT 1 );
	RETURN lastDownload;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- function getNextTide
-- -----------------------------------------------------

USE `smartpump`;
DROP function IF EXISTS `smartpump`.`getNextTide`;

DELIMITER $$
USE `smartpump`$$


CREATE FUNCTION getNextTide() 
	RETURNS TIMESTAMP
BEGIN 
	DECLARE nextTide TIMESTAMP; 
	SET nextTide = ( SELECT tide_time FROM tide WHERE tide_time > UTC_TIMESTAMP( ) ORDER BY tide_time ASC LIMIT 1 );
    RETURN nextTide;
END$$

DELIMITER ;
USE `smartpump`;

DELIMITER $$

USE `smartpump`$$
DROP TRIGGER IF EXISTS `smartpump`.`tide_BINS` $$
USE `smartpump`$$
CREATE TRIGGER `tide_BINS` BEFORE INSERT ON `tide` FOR EACH ROW

BEGIN
 	SET NEW.data_download_date = NOW();
	
END$$


USE `smartpump`$$
DROP TRIGGER IF EXISTS `smartpump`.`tSystem_AINS` $$
USE `smartpump`$$
CREATE TRIGGER `tSystem_AINS` 
AFTER INSERT ON `tSystem` 
FOR EACH ROW

	INSERT INTO smartpump.log ( log.logTime, log.module, log.message )
	VALUES ( NOW(), 'system', 'system started' );$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
