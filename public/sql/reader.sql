
-- 创建数据库
CREATE SCHEMA `reader`;

-- CREATE user table
CREATE TABLE `reader`.`user` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(30) NOT NULL,
  `nick_name` VARCHAR(50) NULL,
  `register_time` INT(11) NULL,
  `login_time` INT(11) NULL,
  `login_ip` VARCHAR(45) NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`, `openid`));

-- CREATE user history
CREATE TABLE `reader`.`history` (
  `id` INT NOT NULL DEFAULT 1,
  `user_id` INT(10) NOT NULL,
  `chapter_id` VARCHAR(10) NOT NULL COMMENT '书籍id',
  `chapter_num` VARCHAR(10) NOT NULL COMMENT '章节',
  `time` INT(11) NOT NULL COMMENT '时间',
  PRIMARY KEY (`id`));

-- CREATE user bookshelf
CREATE TABLE `reader`.`bookshelf` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(10) NOT NULL,
  `chapter_id` VARCHAR(10) NOT NULL,
  `time` INT(11) NOT NULL,
  `book_info` TEXT(255) NULL  COMMENT '序列化对象',
  PRIMARY KEY (`id`));

-- CREATE user search_record
CREATE TABLE `reader`.`search_record` (
  `id` INT NOT NULL DEFAULT 1,
  `user_id` INT(10) NOT NULL,
  `keyword` VARCHAR(45) NOT NULL,
  `time` INT(11) NULL,
  PRIMARY KEY (`id`))
COMMENT = 'search keyword record';
