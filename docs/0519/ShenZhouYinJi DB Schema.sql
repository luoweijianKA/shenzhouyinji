-- MySQL dump 10.13  Distrib 8.0.31, for macos12 (x86_64)
--
-- Host: gz-cdb-dt4dwvqj.sql.tencentcdb.com    Database: shenzhouyinji
-- ------------------------------------------------------
-- Server version	8.0.22-txsql

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '9ca763aa-cc6d-11ed-860b-e43d1ad7d220:1-155694';

--
-- Table structure for table `badge`
--

DROP TABLE IF EXISTS `badge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `badge` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_badge_event1_idx` (`event_id`),
  CONSTRAINT `fk_badge_event1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `camp`
--

DROP TABLE IF EXISTS `camp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `introduction` text,
  `images` varchar(1024) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `category_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_camp_event1_idx` (`event_id`),
  CONSTRAINT `fk_camp_event1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `camp_task`
--

DROP TABLE IF EXISTS `camp_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_task` (
  `camp_id` varchar(45) NOT NULL,
  `task_id` varchar(45) NOT NULL,
  `task_type` varchar(45) DEFAULT NULL,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`camp_id`,`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversation`
--

DROP TABLE IF EXISTS `conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation` (
  `id` varchar(45) NOT NULL,
  `participant` varchar(256) DEFAULT NULL,
  `from` varchar(45) DEFAULT NULL,
  `to` varchar(45) DEFAULT NULL,
  `content` varchar(1024) DEFAULT NULL,
  `send_time` int DEFAULT NULL,
  `read_time` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` varchar(45) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(256) DEFAULT NULL,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `step` varchar(256) DEFAULT NULL,
  `introduction` text,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `settings` json DEFAULT NULL,
  `enable_award` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_award`
--

DROP TABLE IF EXISTS `event_award`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_award` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `create_time` int NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `award_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_scenery_spot`
--

DROP TABLE IF EXISTS `event_scenery_spot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_scenery_spot` (
  `event_id` varchar(45) NOT NULL,
  `scenery_spot_id` varchar(45) NOT NULL,
  KEY `fk_event_scenery_spot_event1_idx` (`event_id`),
  CONSTRAINT `fk_event_scenery_spot_event1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `followers`
--

DROP TABLE IF EXISTS `followers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `followers` (
  `user_id` varchar(45) NOT NULL,
  `follower` varchar(45) NOT NULL,
  `follower_time` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`follower`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `following`
--

DROP TABLE IF EXISTS `following`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `following` (
  `user_id` varchar(45) NOT NULL,
  `following` varchar(45) NOT NULL,
  `following_time` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`following`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `geocaching_task`
--

DROP TABLE IF EXISTS `geocaching_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `geocaching_task` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `introduction` text,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `electric_fence` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `honour`
--

DROP TABLE IF EXISTS `honour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `honour` (
  `id` varchar(45) NOT NULL,
  `camp_id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `min_points` int DEFAULT NULL,
  `max_points` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_honour_camp1_idx` (`camp_id`),
  CONSTRAINT `fk_honour_camp1` FOREIGN KEY (`camp_id`) REFERENCES `camp` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `category_id` varchar(45) DEFAULT NULL,
  `content` varchar(1024) DEFAULT NULL,
  `sender` varchar(45) DEFAULT NULL,
  `release_time` int DEFAULT NULL,
  `blocking_time` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passport`
--

DROP TABLE IF EXISTS `passport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passport` (
  `id` varchar(45) NOT NULL,
  `passport_set_id` varchar(45) NOT NULL,
  `code` varchar(45) DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_passport_passport_set1_idx` (`passport_set_id`),
  CONSTRAINT `fk_passport_passport_set1` FOREIGN KEY (`passport_set_id`) REFERENCES `passport_set` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passport_set`
--

DROP TABLE IF EXISTS `passport_set`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passport_set` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `issued` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_passport_set_event1_idx` (`event_id`),
  CONSTRAINT `fk_passport_set_event1` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `puzzle_task`
--

DROP TABLE IF EXISTS `puzzle_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puzzle_task` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `countdown` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `introduction` text,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `electric_fence` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `question` varchar(1024) DEFAULT NULL,
  `options` text,
  `answer` varchar(45) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `start_time` int NOT NULL,
  `end_time` int NOT NULL,
  `necessary` tinyint DEFAULT '1',
  `status` int DEFAULT NULL,
  `create_time` int NOT NULL,
  `electric_fence` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question_bank_has_question_task`
--

DROP TABLE IF EXISTS `question_bank_has_question_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank_has_question_task` (
  `question_bank_id` varchar(45) NOT NULL,
  `question_task_id` varchar(45) NOT NULL,
  PRIMARY KEY (`question_bank_id`,`question_task_id`),
  KEY `fk_question_bank_has_question_task_question_task1_idx` (`question_task_id`),
  KEY `fk_question_bank_has_question_task_question_bank1_idx` (`question_bank_id`),
  CONSTRAINT `fk_question_bank_has_question_task_question_bank1` FOREIGN KEY (`question_bank_id`) REFERENCES `question_bank` (`id`),
  CONSTRAINT `fk_question_bank_has_question_task_question_task1` FOREIGN KEY (`question_task_id`) REFERENCES `question_task` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question_task`
--

DROP TABLE IF EXISTS `question_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_task` (
  `id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `questions` text NOT NULL,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenery_spot`
--

DROP TABLE IF EXISTS `scenery_spot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenery_spot` (
  `id` varchar(45) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `name` varchar(256) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `coordinate` varchar(256) DEFAULT NULL,
  `electric_fence` text,
  `Introduction` text,
  `category_id` varchar(45) DEFAULT NULL,
  `position_tolerance` varchar(256) DEFAULT NULL,
  `passport_link` varchar(256) DEFAULT NULL,
  `health_code_link` varchar(256) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `enable_award` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenery_spot_service`
--

DROP TABLE IF EXISTS `scenery_spot_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenery_spot_service` (
  `id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `category_id` varchar(45) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `coordinate` varchar(256) DEFAULT NULL,
  `wxappid` varchar(256) DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '1',
  `introduction` text,
  `expense_instruction` varchar(1024) DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_scenery_spot_service_scenery_spot1_idx` (`sceneryspot_id`),
  CONSTRAINT `fk_scenery_spot_service_scenery_spot1` FOREIGN KEY (`sceneryspot_id`) REFERENCES `scenery_spot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenery_spot_task`
--

DROP TABLE IF EXISTS `scenery_spot_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenery_spot_task` (
  `task_id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `task_type` varchar(45) DEFAULT NULL,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`task_id`,`sceneryspot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `screenshot_task`
--

DROP TABLE IF EXISTS `screenshot_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `screenshot_task` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `introduction` text,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `electric_fence` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stamp`
--

DROP TABLE IF EXISTS `stamp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stamp` (
  `id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL,
  `coordinate` varchar(256) DEFAULT NULL,
  `code` varchar(45) DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_stamp_scenery_spot1_idx` (`sceneryspot_id`),
  CONSTRAINT `fk_stamp_scenery_spot1` FOREIGN KEY (`sceneryspot_id`) REFERENCES `scenery_spot` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_auditing`
--

DROP TABLE IF EXISTS `sys_auditing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_auditing` (
  `id` varchar(45) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `message` varchar(512) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `created_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_auditing_id_uindex` (`id`),
  KEY `sys_auditing_code_created_time_index` (`code`,`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_category`
--

DROP TABLE IF EXISTS `sys_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_category` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `parent_id` varchar(45) DEFAULT NULL,
  `has_subclass` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  `sort` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_config`
--

DROP TABLE IF EXISTS `sys_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_config` (
  `key` varchar(50) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `sys_config_key_uindex` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sys_tag`
--

DROP TABLE IF EXISTS `sys_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_tag` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `category_id` varchar(45) DEFAULT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trek_task`
--

DROP TABLE IF EXISTS `trek_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trek_task` (
  `id` varchar(45) NOT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `step` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `images` varchar(1024) DEFAULT NULL,
  `introduction` text,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL,
  `necessary` tinyint DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `electric_fence` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tweet`
--

DROP TABLE IF EXISTS `tweet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tweet` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `content` text,
  `like` text,
  `like_count` int DEFAULT NULL,
  `share` text,
  `share_count` int DEFAULT NULL,
  `view_count` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  `updated_at` int DEFAULT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `region` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tweet_like_record`
--

DROP TABLE IF EXISTS `tweet_like_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tweet_like_record` (
  `id` varchar(45) NOT NULL,
  `tweet_id` varchar(45) DEFAULT NULL,
  `like_user_id` varchar(45) DEFAULT NULL,
  `like_user_name` varchar(45) DEFAULT NULL,
  `like_user_avatar` varchar(1024) DEFAULT NULL,
  `like_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tweet_share_record`
--

DROP TABLE IF EXISTS `tweet_share_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tweet_share_record` (
  `id` varchar(45) NOT NULL,
  `tweet_id` varchar(45) DEFAULT NULL,
  `share_user_id` varchar(45) DEFAULT NULL,
  `share_user_name` varchar(45) DEFAULT NULL,
  `share_user_avatar` varchar(1024) DEFAULT NULL,
  `share_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tweet_user_action_state`
--

DROP TABLE IF EXISTS `tweet_user_action_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tweet_user_action_state` (
  `tweet_id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `like` int DEFAULT NULL,
  `share` int DEFAULT NULL,
  `view` int DEFAULT NULL,
  PRIMARY KEY (`tweet_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tweet_view_record`
--

DROP TABLE IF EXISTS `tweet_view_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tweet_view_record` (
  `id` varchar(45) NOT NULL,
  `tweet_id` varchar(45) DEFAULT NULL,
  `view_user_id` varchar(45) DEFAULT NULL,
  `view_user_name` varchar(45) DEFAULT NULL,
  `view_user_avatar` varchar(1024) DEFAULT NULL,
  `view_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(45) NOT NULL,
  `login_id` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `role` varchar(45) NOT NULL,
  `wechat` varchar(45) DEFAULT NULL,
  `wechat_name` varchar(45) DEFAULT NULL,
  `wechat_avatar` varchar(1024) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `scopes` json DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_ claim_code`
--

DROP TABLE IF EXISTS `user_ claim_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_ claim_code` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `code` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_ claim_code_user1_idx` (`user_id`),
  CONSTRAINT `fk_user_ claim_code_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_badge`
--

DROP TABLE IF EXISTS `user_badge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badge` (
  `user_id` varchar(45) NOT NULL,
  `badge_id` varchar(45) NOT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `fk_user_badge_badge1_idx` (`badge_id`),
  CONSTRAINT `fk_user_badge_badge1` FOREIGN KEY (`badge_id`) REFERENCES `badge` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_badge_swap`
--

DROP TABLE IF EXISTS `user_badge_swap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_badge_swap` (
  `id` varchar(45) NOT NULL,
  `in_badge` varchar(45) NOT NULL,
  `out_badge` varchar(45) NOT NULL,
  `from` varchar(45) DEFAULT NULL,
  `to` varchar(45) DEFAULT NULL,
  `event_id` varchar(45) NOT NULL,
  `previous_id` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `content` json DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int NOT NULL,
  `expired_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_camp`
--

DROP TABLE IF EXISTS `user_camp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_camp` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `camp_id` varchar(45) DEFAULT NULL,
  `event_id` varchar(45) NOT NULL,
  `passport_id` varchar(45) NOT NULL,
  `honour` varchar(45) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `stamp_count` int NOT NULL DEFAULT '0',
  `status` int DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_camp_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_camp_task`
--

DROP TABLE IF EXISTS `user_camp_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_camp_task` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `camp_id` varchar(45) NOT NULL,
  `task_id` varchar(45) NOT NULL,
  `result` text,
  `points` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `audit` varchar(45) DEFAULT NULL,
  `create_time` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_camp_task_camp_task1_idx` (`camp_id`,`task_id`),
  CONSTRAINT `fk_user_camp_task_camp_task1` FOREIGN KEY (`camp_id`, `task_id`) REFERENCES `camp_task` (`camp_id`, `task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_individentity`
--

DROP TABLE IF EXISTS `user_individentity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_individentity` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `account_id` varchar(50) NOT NULL,
  `flow_id` varchar(50) NOT NULL,
  `short_link` varchar(512) NOT NULL,
  `url` varchar(512) NOT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_indivIdentity_id_uindex` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_like_record`
--

DROP TABLE IF EXISTS `user_like_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_like_record` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `liker` varchar(45) DEFAULT NULL,
  `like_tweet` varchar(45) DEFAULT NULL,
  `like_time` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_notification`
--

DROP TABLE IF EXISTS `user_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notification` (
  `user_id` varchar(45) NOT NULL,
  `notification_id` varchar(45) NOT NULL,
  `status` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `fk_user_notification_notification1_idx` (`notification_id`),
  CONSTRAINT `fk_user_notification_notification1` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_passport`
--

DROP TABLE IF EXISTS `user_passport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_passport` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `user_camp_id` varchar(45) DEFAULT NULL,
  `event_id` varchar(45) NOT NULL,
  `passport_code` varchar(45) DEFAULT NULL,
  `real_name` varchar(45) DEFAULT NULL,
  `nric` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `profession` varchar(45) DEFAULT NULL,
  `claim_code` varchar(45) DEFAULT NULL,
  `authentication` varchar(45) DEFAULT NULL,
  `guardian_name` varchar(45) DEFAULT NULL,
  `guardian_nric` varchar(45) DEFAULT NULL,
  `guardian_phone` varchar(45) DEFAULT NULL,
  `claim_by` varchar(45) DEFAULT NULL,
  `claim_time` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_points`
--

DROP TABLE IF EXISTS `user_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_points` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `content` varchar(256) DEFAULT NULL,
  `op` varchar(10) DEFAULT NULL,
  `points` int NOT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_points_user_id_event_id_index` (`user_id`,`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile` (
  `id` varchar(45) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `birthday` int DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `tags` varchar(45) DEFAULT NULL,
  `nric` varchar(45) DEFAULT NULL,
  `authentication` tinyint DEFAULT NULL,
  `profession` varchar(45) DEFAULT NULL,
  `guardian_name` varchar(45) DEFAULT NULL,
  `guardian_nric` varchar(45) DEFAULT NULL,
  `guardian_phone` varchar(45) DEFAULT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_profile_user1_idx` (`id`),
  CONSTRAINT `fk_user_profile_user1` FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_record`
--

DROP TABLE IF EXISTS `user_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_record` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `tweet_id` varchar(45) DEFAULT NULL,
  `tweet_user_id` varchar(45) DEFAULT NULL,
  `action_type` varchar(45) DEFAULT NULL,
  `time` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_stamp`
--

DROP TABLE IF EXISTS `user_stamp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stamp` (
  `user_id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `code` varchar(256) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `like_count` int DEFAULT NULL,
  `view_count` int DEFAULT NULL,
  `share_count` int DEFAULT NULL,
  `status` int NOT NULL DEFAULT '0',
  `create_time` int NOT NULL,
  PRIMARY KEY (`user_id`,`event_id`,`sceneryspot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_stamp_points_record`
--

DROP TABLE IF EXISTS `user_stamp_points_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stamp_points_record` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `action_user_id` varchar(45) DEFAULT NULL,
  `like` int DEFAULT NULL,
  `share` int DEFAULT NULL,
  `view` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_stamp_record`
--

DROP TABLE IF EXISTS `user_stamp_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stamp_record` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) DEFAULT NULL,
  `event_id` varchar(45) DEFAULT NULL,
  `sceneryspot_id` varchar(45) DEFAULT NULL,
  `action_user_id` varchar(45) DEFAULT NULL,
  `action_type` varchar(45) DEFAULT NULL,
  `time` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_task`
--

DROP TABLE IF EXISTS `user_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_task` (
  `id` varchar(45) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `event_id` varchar(45) NOT NULL,
  `camp_id` varchar(45) NOT NULL,
  `sceneryspot_id` varchar(45) NOT NULL,
  `task_id` varchar(45) NOT NULL,
  `task_category` varchar(45) NOT NULL,
  `result` text NOT NULL,
  `points` int NOT NULL,
  `status` int NOT NULL,
  `audit` varchar(45) DEFAULT NULL,
  `create_time` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_tweet_status`
--

DROP TABLE IF EXISTS `user_tweet_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tweet_status` (
  `user_id` varchar(45) NOT NULL,
  `follower_count` int DEFAULT NULL,
  `following_count` int DEFAULT NULL,
  `tweet_count` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_unread_message`
--

DROP TABLE IF EXISTS `user_unread_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_unread_message` (
  `user_id` varchar(45) NOT NULL,
  `notification` int DEFAULT NULL,
  `conversation` int DEFAULT NULL,
  `followers` int DEFAULT NULL,
  `like` int DEFAULT NULL,
  `share` int DEFAULT NULL,
  `view` int DEFAULT NULL,
  `system` int DEFAULT NULL,
  `customer_service` int DEFAULT NULL,
  `reward` int DEFAULT NULL,
  `badge` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-19 10:23:11
