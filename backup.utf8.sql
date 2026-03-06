-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: fish_app
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postalCode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isDefault` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_d25f1ea79e282cc8a42bd616aa` (`userId`),
  CONSTRAINT `FK_d25f1ea79e282cc8a42bd616aa3` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (1,1,'鍚存偊涔?,'18864577744','姹熻嫃鎾?,'鑻忓窞','寮犲娓?,'鍏嗕赴','215600',1,'2026-02-12 11:18:09.577044','2026-02-12 11:18:09.577000'),(2,2,'鍚村厛鐢?,'18864677777','姹熻嫃','鑻忓窞','寮犲娓?,'鍏嗕赴璺?13鍙?,'215600',1,'2026-02-12 11:21:43.033691','2026-02-12 11:21:43.033691');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_df04e57736b705180c89c5a636` (`userId`,`productId`),
  KEY `FK_371eb56ecc4104c2644711fa85f` (`productId`),
  CONSTRAINT `FK_371eb56ecc4104c2644711fa85f` FOREIGN KEY (`productId`) REFERENCES `fish_product` (`id`),
  CONSTRAINT `FK_756f53ab9466eb52a52619ee019` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (3,2,2,3,'2026-02-12 17:35:17.676401','2026-02-12 21:08:12.000000'),(4,1,2,1,'2026-02-12 21:00:31.268693','2026-02-12 21:00:31.268693'),(5,2,33,1,'2026-02-12 21:40:15.854403','2026-02-12 21:40:15.854403');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentId` int DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'铏剧被',NULL,NULL,0,'2026-02-12 09:56:41.392655'),(2,'娣℃按楸肩被',NULL,NULL,1,'2026-02-12 09:57:00.086607'),(3,'娴烽奔',NULL,NULL,0,'2026-02-12 21:22:34.842313'),(4,'娣℃按楸?,NULL,NULL,0,'2026-02-12 21:22:34.842313'),(5,'娣辨捣楸?,NULL,NULL,0,'2026-02-12 21:22:34.842313'),(6,'璐濈被',NULL,NULL,0,'2026-02-12 21:22:34.842313'),(7,'铏剧被',NULL,NULL,0,'2026-02-12 21:22:34.842313'),(8,'锜圭被',NULL,NULL,0,'2026-02-12 21:22:34.842313'),(9,'楸煎共鍒跺搧',NULL,NULL,0,'2026-02-12 21:22:34.842313'),(10,'楸间父鍒跺搧',NULL,NULL,0,'2026-02-12 21:22:34.842313');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon`
--

DROP TABLE IF EXISTS `coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('discount','reduce','free') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'discount',
  `value` decimal(10,2) NOT NULL,
  `minAmount` decimal(10,2) DEFAULT NULL,
  `totalCount` int NOT NULL DEFAULT '-1',
  `usedCount` int NOT NULL DEFAULT '0',
  `limitPerUser` int NOT NULL DEFAULT '1',
  `startTime` datetime DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon`
--

LOCK TABLES `coupon` WRITE;
/*!40000 ALTER TABLE `coupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorite`
--

DROP TABLE IF EXISTS `favorite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f0e7bf803aa937033d10dc07ed` (`userId`,`productId`),
  KEY `FK_b8e337759b77baa0a4055d1894e` (`productId`),
  CONSTRAINT `FK_83b775fdebbe24c29b2b5831f2d` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_b8e337759b77baa0a4055d1894e` FOREIGN KEY (`productId`) REFERENCES `fish_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite`
--

LOCK TABLES `favorite` WRITE;
/*!40000 ALTER TABLE `favorite` DISABLE KEYS */;
INSERT INTO `favorite` VALUES (2,2,2,'2026-02-12 17:25:13.512833');
/*!40000 ALTER TABLE `favorite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fish_product`
--

DROP TABLE IF EXISTS `fish_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fish_product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `imageUrls` json DEFAULT NULL,
  `nutritionInfo` text COLLATE utf8mb4_unicode_ci,
  `cookingTips` text COLLATE utf8mb4_unicode_ci,
  `freshnessLevel` int NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_442ab0f2fa5bfa37fb136b73cd5` (`categoryId`),
  CONSTRAINT `FK_442ab0f2fa5bfa37fb136b73cd5` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fish_product`
--

LOCK TABLES `fish_product` WRITE;
/*!40000 ALTER TABLE `fish_product` DISABLE KEYS */;
INSERT INTO `fish_product` VALUES (2,'灏忛緳铏?,1,30.00,9994,'灏忛緳铏鹃潪甯告湁钀ュ吇濂藉悆','[\"http://localhost:3000/uploads/1770995818887-ed7c6b7402dda633\"]','灏忛緳铏鹃潪甯告湁钀ュ吇濂藉悆','娓呰捀锛岀孩鐑х瓑绛?,1,'2026-02-12 09:57:44.094812','2026-02-13 23:17:00.000000'),(3,'涓夋枃楸煎埡韬椁?,1,88.00,100,'绮鹃€夋尓濞佷笁鏂囬奔锛岄€傚悎鍒鸿韩銆佺敓鍚冩垨杞荤厧銆?,'[\"http://localhost:3000/uploads/1770995830322-1841ee97d98cf54b\"]','瀵屽惈浼樿川铔嬬櫧鍜?Omega-3 涓嶉ケ鍜岃剛鑲吀锛屾湁鐩婂績琛€绠″仴搴枫€?,'寤鸿鍒囩墖鍚庢惌閰嶉叡娌硅姤鏈鐢紝鎴栬交鐓庤嚦涓ら潰寰劍锛岄攣浣忛矞鍛炽€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:17:12.000000'),(4,'娣辨捣槌曢奔鏌?,3,65.00,80,'闃挎媺鏂姞槌曢奔鏌筹紝鑲夎川缁嗚吇銆佸埡灏戙€?,'[\"http://localhost:3000/uploads/1770996346642-dadab982adf44f1f\"]','楂樿泲鐧姐€佷綆鑴傝偑锛岄潪甯搁€傚悎鍎跨鍜岃€佷汉椋熺敤銆?,'鍙竻钂搞€佺厧鐑ゆ垨鍋氶奔鎺掞紝鎼厤鏌犳姹侀鍛虫洿浣炽€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:25:47.000000'),(5,'娓呰捀妗傞奔',2,48.00,60,'娲绘楸肩幇鏉€閫熷喕锛屼繚鐣欓矞娲诲彛鎰熴€?,'[\"http://localhost:3000/uploads/1770995853507-7a46eb0d5f1bda22\"]','娣℃按楸间唬琛ㄤ箣涓€锛岃惀鍏诲潎琛°€佸彛鎰熺粏瀚┿€?,'缁忓吀鍋氭硶涓鸿懕濮滄竻钂革紝娣嬬儹娌规彁棣欙紝鏈€澶ч檺搴︿繚鐣欏師姹佸師鍛炽€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:17:35.000000'),(6,'楹昏荆灏忛緳铏撅紙鍑€铏撅級',4,98.00,120,'楹昏荆鍙ｅ懗灏忛緳铏撅紝鍑€铏惧鐞嗭紝澶嶇儹鍗抽銆?,'[\"http://localhost:3000/uploads/1770995864644-05655ae1c9d12453\"]','铏捐倝瀵屽惈铔嬬櫧璐ㄥ拰澶氱寰噺鍏冪礌锛屾槸澶滃鑱氫細鐨勭儹闂ㄩ€夋嫨銆?,'寤鸿瑙ｅ喕鍚庣敤灏忕伀鍔犵儹锛屼繚鎸佹堡姹佹祿閮侊紱涔熷彲鎼厤鍟ら厭銆佸暏閰掗ギ鍝侀鐢ㄣ€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:17:46.000000'),(7,'閲戞灙楸煎埡韬?,1,128.00,50,'鏂伴矞閲戞灙楸硷紝鑲夎川绱у疄锛屽彛鎰熼矞缇庯紝閫傚悎鍋氬埡韬€?,'[\"http://localhost:3000/uploads/1770995875029-011d56effe08245e\"]','瀵屽惈浼樿川铔嬬櫧璐ㄥ拰DHA锛屾湁鍔╀簬澶ц剳鍙戣偛鍜屽績琛€绠″仴搴枫€?,'鍒囩墖鍚庣洿鎺ラ鐢紝鎴栨惌閰嶈姤鏈€侀叡娌癸紝涔熷彲鍋氭垚閲戞灙楸兼矙鎷夈€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:17:56.000000'),(8,'甯﹂奔娈?,1,35.00,150,'鏂伴矞甯﹂奔娈碉紝鑲夎川椴滃锛岄€傚悎绾㈢儳鎴栨竻钂搞€?,'[\"http://localhost:3000/uploads/1770996210025-61e9cfc27a144200\"]','瀵屽惈铔嬬櫧璐ㄣ€侀挋銆佺７绛夎惀鍏绘垚鍒嗭紝鏈夊姪浜庨楠煎仴搴枫€?,'鍙孩鐑с€佹竻钂告垨娌圭偢锛岀孩鐑ф椂鍔犲叆鏂欓厭鍜屽鐗囧幓鑵ユ晥鏋滄洿浣炽€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:23:31.000000'),(9,'榛勮姳楸?,4,42.00,90,'鏂伴矞榛勮姳楸硷紝鑲夎川缁嗗锛屽懗閬撻矞缇庛€?,'[\"http://localhost:3000/uploads/1770996121991-3ca8912d247e4eab\"]','瀵屽惈浼樿川铔嬬櫧銆佺淮鐢熺礌鍜岀熆鐗╄川锛岃惀鍏讳环鍊奸珮銆?,'閫傚悎娓呰捀銆佺孩鐑ф垨鐓庡埗锛屾竻钂告椂鍔犲叆钁卞涓濇彁鍛炽€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:22:03.000000'),(10,'椴堥奔',2,55.00,70,'娲婚矆楸硷紝鑲夎川椴滅編锛屽埡灏戣倝澶氥€?,'[\"http://localhost:3000/uploads/1770996413092-9e5b06c9df71b09b\"]','楂樿泲鐧姐€佷綆鑴傝偑锛屽惈鏈変赴瀵岀殑DHA鍜孍PA銆?,'缁忓吀鍋氭硶涓烘竻钂革紝涔熷彲绾㈢儳鎴栧仛閰歌彍楸硷紝娓呰捀鏃惰捀8-10鍒嗛挓鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:26:54.000000'),(11,'鑽夐奔',2,28.00,120,'鏂伴矞鑽夐奔锛岃倝璐ㄥ帤瀹烇紝閫傚悎澶氱鐑归オ鏂瑰紡銆?,'[\"http://localhost:3000/uploads/1770996426768-02761e31b41dbfdd\"]','瀵屽惈铔嬬櫧璐ㄥ拰涓嶉ケ鍜岃剛鑲吀锛岃惀鍏讳赴瀵屻€?,'鍙仛姘寸叜楸笺€侀吀鑿滈奔銆佺孩鐑ч奔绛夛紝姘寸叜楸兼椂娉ㄦ剰鐏€欙紝淇濇寔楸艰倝椴滃銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:27:08.000000'),(12,'椴奔',2,32.00,100,'鏂伴矞椴奔锛岃倝璐ㄧ粏瀚╋紝閫傚悎鐐栨堡銆?,'[\"http://localhost:3000/uploads/1770995923820-dd1c1b69a28a9d05\"]','瀵屽惈浼樿川铔嬬櫧鍜屽绉嶆皑鍩洪吀锛屾湁婊嬭ˉ鍔熸晥銆?,'鏈€閫傚悎鐐栨堡锛屽姞鍏ヨ眴鑵愬拰濮滅墖锛岀倴鐓?0鍒嗛挓锛屾堡姹侀矞缇庤惀鍏汇€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:18:45.000000'),(13,'姣旂洰楸?,3,75.00,60,'娣辨捣姣旂洰楸硷紝鑲夎川缁嗗锛屽彛鎰熺嫭鐗广€?,'[\"http://localhost:3000/uploads/1770996582064-550589803e94733d\"]','瀵屽惈铔嬬櫧璐ㄥ拰Omega-3鑴傝偑閰革紝钀ュ吇浠峰€奸珮銆?,'閫傚悎娓呰捀鎴栫厧鍒讹紝娓呰捀鏃跺姞鍏ヨ懕濮滃拰鏂欓厭鍘昏叆銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:29:43.000000'),(14,'鐭虫枒楸?,3,168.00,30,'娣辨捣鐭虫枒楸硷紝鑲夎川绱у疄锛屽懗閬撻矞缇庛€?,'[\"http://localhost:3000/uploads/1770995981767-931ebb7251aeef5e\"]','楂樿泲鐧姐€佷綆鑴傝偑锛屽惈鏈変赴瀵岀殑鑳跺師铔嬬櫧銆?,'閫傚悎娓呰捀鎴栫孩鐑э紝娓呰捀鏃惰捀10-12鍒嗛挓锛屼繚鎸佽倝璐ㄩ矞瀚┿€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:19:43.000000'),(15,'娴烽矆楸?,1,58.00,65,'鏂伴矞娴烽矆楸硷紝鑲夎川椴滅編锛岃惀鍏讳赴瀵屻€?,'[\"http://localhost:3000/uploads/1770995993277-afe3183c41354a07\"]','瀵屽惈浼樿川铔嬬櫧鍜屽绉嶇淮鐢熺礌锛屾湁鍔╀簬澧炲己鍏嶇柅鍔涖€?,'鍙竻钂搞€佺孩鐑ф垨鐓庡埗锛屾竻钂告椂鍔犲叆钁卞涓濆拰钂搁奔璞夋补銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:19:54.000000'),(16,'鍩哄洿铏?,7,68.00,100,'鏂伴矞鍩哄洿铏撅紝鑲夎川Q寮癸紝鍛抽亾椴滅編銆?,'[\"http://localhost:3000/uploads/1770996484571-984bc144d9471973\"]','瀵屽惈铔嬬櫧璐ㄥ拰閽欒川锛屾湁鍔╀簬楠ㄩ鍋ュ悍銆?,'鍙櫧鐏笺€佹竻钂告垨鐐掑埗锛岀櫧鐏兼椂姘村紑鍚庣叜2-3鍒嗛挓鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:28:11.000000'),(17,'瀵硅櫨',7,88.00,80,'澶у铏撅紝鑲夎川楗辨弧锛屽彛鎰熼矞缇庛€?,'[\"http://localhost:3000/uploads/1770996557738-4faf12adc84c1117\"]','楂樿泲鐧姐€佷綆鑴傝偑锛屽惈鏈変赴瀵岀殑铏鹃潚绱犮€?,'閫傚悎鐧界伡銆佹补鐒栨垨鐑ゅ埗锛屾补鐒栨椂鍔犲叆鐣寗閰卞拰绯栵紝鍛抽亾鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:29:24.000000'),(18,'鐨毊铏?,5,45.00,110,'鏂伴矞鐨毊铏撅紝鑲夎川椴滅敎锛岄€傚悎澶氱鍋氭硶銆?,'[\"http://localhost:3000/uploads/1770995933881-5e3d0f9e1ea119ac\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱寰噺鍏冪礌锛岃惀鍏讳环鍊奸珮銆?,'鍙櫧鐏笺€佹鐩愭垨娓呰捀锛屾鐩愮毊鐨櫨鏃剁偢鑷抽噾榛勶紝鎾掍笂妞掔洂鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:18:55.000000'),(19,'澶ч椄锜?,8,158.00,40,'闃虫緞婀栧ぇ闂歌煿锛岃煿榛勯ケ婊★紝鑲夎川椴滅編銆?,'[\"http://localhost:3000/uploads/1770996095286-5979f546ff3495ed\"]','瀵屽惈浼樿川铔嬬櫧鍜屽绉嶇淮鐢熺礌锛岃煿榛勮惀鍏讳环鍊兼瀬楂樸€?,'鏈€浣冲仛娉曚负娓呰捀锛屾按寮€鍚庤捀15-20鍒嗛挓锛岃樃濮滈唻姹侀鐢ㄣ€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:21:41.000000'),(20,'姊瓙锜?,6,78.00,50,'鏂伴矞姊瓙锜癸紝鑲夎川楗辨弧锛屽懗閬撻矞缇庛€?,'[\"http://localhost:3000/uploads/1770996780074-66ba656b775acbc4\"]','瀵屽惈铔嬬櫧璐ㄥ拰閽欒川锛屾湁鍔╀簬楠ㄩ鍋ュ悍銆?,'鍙竻钂搞€佺倰鍒舵垨鍋氳煿鐓诧紝鐐掑埗鏃跺姞鍏ヨ懕濮滃拰鏂欓厭鍘昏叆銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:33:01.000000'),(21,'鑺辫洡',4,25.00,150,'鏂伴矞鑺辫洡锛岃倝璐ㄩ矞瀚╋紝閫傚悎澶氱鐑归オ銆?,'[\"http://localhost:3000/uploads/1770996800619-745ab679b1ae88aa\"]','瀵屽惈铔嬬櫧璐ㄥ拰閿屽厓绱狅紝鏈夊姪浜庢彁楂樺厤鐤姏銆?,'鍙垎鐐掋€佸仛姹ゆ垨钂稿埗锛岀垎鐐掓椂鍔犲叆钂滆搲鍜岃荆妞掞紝鍛抽亾鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:33:21.000000'),(22,'鎵囪礉',4,45.00,80,'鏂伴矞鎵囪礉锛岃倝璐ㄩ矞瀚╋紝钀ュ吇涓板瘜銆?,'[\"http://localhost:3000/uploads/1770996152471-662fc4b86e1eae2d\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱姘ㄥ熀閰革紝钀ュ吇浠峰€奸珮銆?,'鍙挏钃夎捀銆佺儰鍒舵垨鍋氭堡锛岃挏钃夎捀鏃跺姞鍏ョ矇涓濆拰钂滆搲锛岃捀5-6鍒嗛挓鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:22:34.000000'),(23,'鐢熻殱',4,58.00,60,'鏂伴矞鐢熻殱锛岃倝璐ㄩケ婊★紝鍛抽亾椴滅編銆?,'[\"http://localhost:3000/uploads/1770996821206-9465e4e7917c9ed6\"]','瀵屽惈閿屽厓绱犲拰浼樿川铔嬬櫧锛屾湁鍔╀簬鎻愰珮鍏嶇柅鍔涖€?,'鍙敓鍚冦€佽挏钃夌儰鎴栨竻钂革紝鐢熷悆鏃舵惌閰嶆煚妾眮鍜岃姤鏈€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:33:42.000000'),(24,'楸块奔',1,38.00,90,'鏂伴矞楸块奔锛岃倝璐≦寮癸紝閫傚悎澶氱鍋氭硶銆?,'[\"http://localhost:3000/uploads/1770996017737-b757445285999091\"]','瀵屽惈铔嬬櫧璐ㄥ拰鐗涚：閰革紝鏈夊姪浜庨檷浣庤儐鍥洪唶銆?,'鍙垎鐐掋€佺儰鍒舵垨鍋氭堡锛岀垎鐐掓椂鍔犲叆娲嬭懕鍜岄潚妞掞紝鍙ｆ劅鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:20:19.000000'),(25,'绔犻奔',1,52.00,70,'鏂伴矞绔犻奔锛岃倝璐ㄧ揣瀹烇紝鍙ｆ劅鐙壒銆?,'[\"http://localhost:3000/uploads/1770996006004-aec41cf9e8b1a54d\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱姘ㄥ熀閰革紝钀ュ吇浠峰€奸珮銆?,'鍙櫧鐏笺€佺倰鍒舵垨鍋氱珷楸煎皬涓稿瓙锛岀櫧鐏兼椂姘村紑鍚庣叜3-5鍒嗛挓鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:20:07.000000'),(26,'澧ㄩ奔',1,48.00,75,'鏂伴矞澧ㄩ奔锛岃倝璐ㄩ矞缇庯紝閫傚悎澶氱鐑归オ銆?,'[\"http://localhost:3000/uploads/1770996032137-76e9bb14c9fcabf1\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱鐭跨墿璐紝鏈夊姪浜庤韩浣撳仴搴枫€?,'鍙垎鐐掋€佸仛姹ゆ垨鐑ゅ埗锛岀垎鐐掓椂鍔犲叆闊彍鍜岃荆妞掞紝鍛抽亾鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:20:33.000000'),(27,'楸间父',8,28.00,200,'鎵嬪伐楸间父锛孮寮圭埥婊戯紝閫傚悎鍋氭堡鎴栫伀閿呫€?,'[\"http://localhost:3000/uploads/1770996893026-1b5365e29d15a03a\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱姘ㄥ熀閰革紝鏄撲簬娑堝寲鍚告敹銆?,'鍙仛姹ゃ€佺伀閿呮垨鐐掑埗锛屽仛姹ゆ椂鍔犲叆绱彍鍜岃懕鑺憋紝鍛抽亾椴滅編銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:34:54.000000'),(28,'楸艰眴鑵?,8,22.00,180,'鏂伴矞楸艰眴鑵愶紝鍙ｆ劅瀚╂粦锛岄€傚悎澶氱鍋氭硶銆?,'[\"http://localhost:3000/uploads/1770996919583-f52b59e571609a2b\"]','瀵屽惈铔嬬櫧璐ㄥ拰閽欒川锛岃惀鍏讳环鍊奸珮銆?,'鍙仛姹ゃ€佺伀閿呮垨鐐掑埗锛岀倰鍒舵椂鍔犲叆闈掓鍜屾磱钁憋紝鍙ｆ劅鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:35:20.000000'),(29,'楸肩墖',1,35.00,120,'鏂伴矞楸肩墖锛岃倝璐ㄩ矞瀚╋紝閫傚悎鍋氭按鐓奔鎴栭吀鑿滈奔銆?,'[\"http://localhost:3000/uploads/1770996847046-5abbb088491494c6\"]','瀵屽惈浼樿川铔嬬櫧鍜屽绉嶆皑鍩洪吀锛岃惀鍏讳环鍊奸珮銆?,'鍙仛姘寸叜楸笺€侀吀鑿滈奔鎴栨竻鐐掞紝姘寸叜楸兼椂娉ㄦ剰鐏€欙紝淇濇寔楸艰倝椴滃銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:34:08.000000'),(30,'楸煎ご',1,25.00,100,'鏂伴矞楸煎ご锛岄€傚悎鍋氶奔澶磋眴鑵愭堡銆?,'[\"http://localhost:3000/uploads/1770996239068-a7916c6db50bd513\"]','瀵屽惈铔嬬櫧璐ㄥ拰DHA锛屾湁鍔╀簬澶ц剳鍙戣偛銆?,'鏈€閫傚悎鍋氶奔澶磋眴鑵愭堡锛屽姞鍏ヨ眴鑵愬拰濮滅墖锛岀倴鐓?0鍒嗛挓锛屾堡姹侀矞缇庛€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:24:00.000000'),(31,'楸肩苯',1,68.00,50,'鏂伴矞楸肩苯锛屽彛鎰熺嫭鐗癸紝钀ュ吇浠峰€奸珮銆?,'[\"http://localhost:3000/uploads/1770996178072-548ada0559acf00e\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱缁寸敓绱狅紝钀ュ吇浠峰€兼瀬楂樸€?,'鍙仛瀵垮徃銆佺倰鍒舵垨鍋氭堡锛屽仛瀵垮徃鏃舵惌閰嶇背楗拰绱彍锛屽懗閬撻矞缇庛€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:22:59.000000'),(32,'槌楅奔',1,88.00,45,'鏂伴矞槌楅奔锛岃倝璐ㄨ偉缇庯紝閫傚悎鍋氶硹楸奸キ銆?,'[\"http://localhost:3000/uploads/1770996641801-8b1954b7e45b565b\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱姘ㄥ熀閰革紝钀ュ吇浠峰€奸珮銆?,'鍙仛槌楅奔楗€佺儰鍒舵垨娓呰捀锛屽仛槌楅奔楗椂鍔犲叆鐓х儳姹侊紝鍛抽亾鏇翠匠銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:30:42.000000'),(33,'绉嬪垁楸?,1,32.00,110,'鏂伴矞绉嬪垁楸硷紝鑲夎川绱у疄锛岄€傚悎鐑ゅ埗銆?,'[\"http://localhost:3000/uploads/1770996196269-2792bf2f4aef1faa\"]','瀵屽惈铔嬬櫧璐ㄥ拰Omega-3鑴傝偑閰革紝鏈夊姪浜庡績琛€绠″仴搴枫€?,'鏈€閫傚悎鐑ゅ埗锛岀儰鍒舵椂鍔犲叆鐩愬拰鏌犳姹侊紝鐑よ嚦涓ら潰閲戦粍鍗冲彲銆?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:23:17.000000'),(34,'澶氬疂楸?,3,95.00,40,'娣辨捣澶氬疂楸硷紝鑲夎川缁嗗锛屽懗閬撻矞缇庛€?,'[\"http://localhost:3000/uploads/1770996613547-5631630422c1f826\"]','楂樿泲鐧姐€佷綆鑴傝偑锛屽惈鏈変赴瀵岀殑鑳跺師铔嬬櫧銆?,'閫傚悎娓呰捀鎴栫孩鐑э紝娓呰捀鏃惰捀10-12鍒嗛挓锛屼繚鎸佽倝璐ㄩ矞瀚┿€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:30:15.000000'),(35,'椹矝楸?,1,42.00,85,'鏂伴矞椹矝楸硷紝鑲夎川绱у疄锛岄€傚悎澶氱鍋氭硶銆?,'[\"http://localhost:3000/uploads/1770996050230-42da4ee86f6b13fb\"]','瀵屽惈铔嬬櫧璐ㄥ拰澶氱鐭跨墿璐紝钀ュ吇浠峰€奸珮銆?,'鍙竻钂搞€佺孩鐑ф垨鐓庡埗锛岀厧鍒舵椂鍔犲叆濮滅墖鍜屾枡閰掑幓鑵ャ€?,1,'2026-02-12 21:22:34.844633','2026-02-13 23:20:51.000000');
/*!40000 ALTER TABLE `fish_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_recognition`
--

DROP TABLE IF EXISTS `image_recognition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_recognition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `imageUrl` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recognizedFishId` int DEFAULT NULL,
  `confidence` decimal(5,2) NOT NULL,
  `recognitionResultJson` json NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_recognition`
--

LOCK TABLES `image_recognition` WRITE;
/*!40000 ALTER TABLE `image_recognition` DISABLE KEYS */;
INSERT INTO `image_recognition` VALUES (1,1,'http://localhost:3000/uploads/1770860680082-6ca905c7bda83704.png',NULL,0.31,'{\"fishName\": \"gilt_head_bream\", \"confidence\": 0.31006598472595215, \"fishNameCN\": \"閲戝ご椴穃", \"alternatives\": [{\"name\": \"sea_bass\", \"nameCN\": \"椴堥奔\", \"confidence\": 0.25709155201911926}, {\"name\": \"shrimp\", \"nameCN\": \"铏綷", \"confidence\": 0.12930990755558014}]}','2026-02-12 09:44:43.529809'),(2,1,'http://localhost:3000/uploads/1770885477127-b69c8a79f4e91540.jpg',NULL,0.38,'{\"fishName\": \"trout\", \"confidence\": 0.3808363378047943, \"fishNameCN\": \"槌熼奔\", \"alternatives\": [{\"name\": \"sea_bass\", \"nameCN\": \"椴堥奔\", \"confidence\": 0.3543041944503784}, {\"name\": \"black_sea_sprat\", \"nameCN\": \"榛戞捣椴遍奔\", \"confidence\": 0.17481128871440887}]}','2026-02-12 16:38:00.963974'),(3,1,'http://localhost:3000/uploads/1770889236318-2aa3a8daa326bfc8.png',NULL,0.49,'{\"fishName\": \"shrimp\", \"confidence\": 0.4879635572433472, \"fishNameCN\": \"铏綷", \"alternatives\": [{\"name\": \"trout\", \"nameCN\": \"槌熼奔\", \"confidence\": 0.224932998418808}, {\"name\": \"red_mullet\", \"nameCN\": \"绾㈤不楸糪", \"confidence\": 0.18465539813041687}]}','2026-02-12 17:40:38.948476'),(4,1,'http://localhost:3000/uploads/1770889376765-274039b1f2a8a838.png',NULL,0.49,'{\"fishName\": \"shrimp\", \"confidence\": 0.4879635572433472, \"fishNameCN\": \"铏綷", \"alternatives\": [{\"name\": \"trout\", \"nameCN\": \"槌熼奔\", \"confidence\": 0.224932998418808}, {\"name\": \"red_mullet\", \"nameCN\": \"绾㈤不楸糪", \"confidence\": 0.18465539813041687}]}','2026-02-12 17:42:59.244248'),(5,2,'http://localhost:3000/uploads/1770997140413-580c19a1d8c98cb6',NULL,0.94,'{\"fishName\": \"shrimp\", \"confidence\": 0.9352189302444458, \"fishNameCN\": \"铏綷", \"alternatives\": [{\"name\": \"gilt_head_bream\", \"nameCN\": \"閲戝ご椴穃", \"confidence\": 0.03458574786782265}, {\"name\": \"trout\", \"nameCN\": \"槌熼奔\", \"confidence\": 0.013953317888081074}]}','2026-02-13 23:39:05.134431');
/*!40000 ALTER TABLE `image_recognition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` enum('order','system','promotion','review') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `relatedId` int DEFAULT NULL,
  `isRead` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_ea34abc69625e58f67007481e1` (`userId`,`isRead`),
  CONSTRAINT `FK_1ced25315eb974b73391fb1c81b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES (1,2,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD177086655238432ICVWVK8 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',1,1,'2026-02-12 11:22:32.409388'),(3,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770875126924FHTFATRLU 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?10',2,1,'2026-02-12 13:45:26.950871'),(4,1,'order','璁㈠崟鐘舵€佹洿鏂帮細宸叉敮浠?,'鎮ㄧ殑璁㈠崟 ORD1770875126924FHTFATRLU 鐘舵€佸凡鏇存柊涓猴細宸叉敮浠?,2,1,'2026-02-12 13:48:57.081250'),(5,1,'order','璁㈠崟鐘舵€佹洿鏂帮細宸插彂璐?,'鎮ㄧ殑璁㈠崟 ORD1770875126924FHTFATRLU 鐘舵€佸凡鏇存柊涓猴細宸插彂璐?,2,1,'2026-02-12 13:49:01.093514'),(6,1,'order','璁㈠崟鐘舵€佹洿鏂帮細宸插畬鎴?,'鎮ㄧ殑璁㈠崟 ORD1770875126924FHTFATRLU 鐘舵€佸凡鏇存柊涓猴細宸插畬鎴?,2,1,'2026-02-12 13:49:02.896838'),(7,2,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770888576760DL92XA4QM 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',3,0,'2026-02-12 17:29:36.791839'),(8,2,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD17708889082322THZ65WO6 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',4,0,'2026-02-12 17:35:08.258580'),(9,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770889399753STXLIRZUM 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',5,1,'2026-02-12 17:43:19.777470'),(10,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770889552450IFDKJP9FV 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',6,1,'2026-02-12 17:45:52.472102'),(11,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770889676086K52X80MV0 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',7,0,'2026-02-12 17:47:56.107376'),(12,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770889989298DXIHKA6RK 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',8,0,'2026-02-12 17:53:09.321240'),(13,1,'order','璁㈠崟鍒涘缓鎴愬姛','鎮ㄧ殑璁㈠崟 ORD1770901438226TIDGCLWYH 宸插垱寤烘垚鍔燂紝璁㈠崟閲戦锛毬?0',9,0,'2026-02-12 21:03:58.245065'),(14,1,'review','鏀跺埌鏂拌瘎浠?,'鍟嗗搧 绉嬪垁楸?鏀跺埌浜嗕竴鏉℃柊璇勪环锛岃瘎鍒嗭細4鏄?,2,0,'2026-02-13 23:36:19.825527'),(15,1,'review','鏀跺埌鏂拌瘎浠?,'鍟嗗搧 澧ㄩ奔 鏀跺埌浜嗕竴鏉℃柊璇勪环锛岃瘎鍒嗭細5鏄?,3,0,'2026-02-13 23:40:02.594624');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` int NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `addressId` int NOT NULL,
  `paymentMethod` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2fa775b82a212c5fc3bb4074c6` (`orderNo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,'ORD177086655238432ICVWVK8',2,30.00,'pending',2,NULL,'2026-02-12 11:22:32.387880','2026-02-12 11:22:32.387880'),(2,'ORD1770875126924FHTFATRLU',1,210.00,'completed',1,NULL,'2026-02-12 13:45:26.927860','2026-02-12 13:49:02.000000'),(3,'ORD1770888576760DL92XA4QM',2,90.00,'pending',2,NULL,'2026-02-12 17:29:36.764727','2026-02-12 17:29:36.764727'),(4,'ORD17708889082322THZ65WO6',2,30.00,'pending',2,NULL,'2026-02-12 17:35:08.236815','2026-02-12 17:35:08.236815'),(5,'ORD1770889399753STXLIRZUM',1,30.00,'pending',1,NULL,'2026-02-12 17:43:19.756276','2026-02-12 17:43:19.756276'),(6,'ORD1770889552450IFDKJP9FV',1,30.00,'pending',1,NULL,'2026-02-12 17:45:52.452541','2026-02-12 17:45:52.452541'),(7,'ORD1770889676086K52X80MV0',1,30.00,'pending',1,NULL,'2026-02-12 17:47:56.089652','2026-02-12 17:47:56.089652'),(8,'ORD1770889989298DXIHKA6RK',1,30.00,'pending',1,NULL,'2026-02-12 17:53:09.302816','2026-02-12 17:53:09.302816'),(9,'ORD1770901438226TIDGCLWYH',1,30.00,'pending',1,NULL,'2026-02-12 21:03:58.229239','2026-02-12 21:03:58.229239');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_646bf9ece6f45dbe41c203e06e0` (`orderId`),
  KEY `FK_904370c093ceea4369659a3c810` (`productId`),
  CONSTRAINT `FK_646bf9ece6f45dbe41c203e06e0` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`),
  CONSTRAINT `FK_904370c093ceea4369659a3c810` FOREIGN KEY (`productId`) REFERENCES `fish_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,1,2,1,30.00,30.00,'2026-02-12 11:22:32.394941'),(2,2,2,7,30.00,210.00,'2026-02-12 13:45:26.936939'),(3,3,2,3,30.00,90.00,'2026-02-12 17:29:36.778868'),(4,4,2,1,30.00,30.00,'2026-02-12 17:35:08.245967'),(5,5,2,1,30.00,30.00,'2026-02-12 17:43:19.765011'),(6,6,2,1,30.00,30.00,'2026-02-12 17:45:52.460124'),(7,7,2,1,30.00,30.00,'2026-02-12 17:47:56.096135'),(8,8,2,1,30.00,30.00,'2026-02-12 17:53:09.309452'),(9,9,2,1,30.00,30.00,'2026-02-12 21:03:58.233070');
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendation_log`
--

DROP TABLE IF EXISTS `recommendation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendation_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `recommendType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `algorithmType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `clicked` tinyint NOT NULL DEFAULT '0',
  `purchased` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=281 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendation_log`
--

LOCK TABLES `recommendation_log` WRITE;
/*!40000 ALTER TABLE `recommendation_log` DISABLE KEYS */;
INSERT INTO `recommendation_log` VALUES (1,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 10:53:14.107231'),(2,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 10:54:49.263539'),(3,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 10:54:54.019548'),(4,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 10:54:58.332300'),(5,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 10:55:38.177758'),(6,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 11:02:50.404347'),(7,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 11:10:00.172329'),(8,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 11:12:47.925165'),(9,1,2,'personalized','personalized',1.00,0,0,'2026-02-12 11:20:18.105743'),(10,2,2,'personalized','personalized',1.00,0,0,'2026-02-12 11:20:44.037932'),(11,2,2,'personalized','personalized',2.00,0,0,'2026-02-12 11:22:29.755398'),(12,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:23:29.496238'),(13,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:26:43.791204'),(14,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:29:49.433228'),(15,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:32:35.590439'),(16,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:33:35.969897'),(17,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:36:24.510221'),(18,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 11:43:29.784980'),(19,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 13:41:46.142245'),(20,1,2,'personalized','personalized',12.00,0,0,'2026-02-12 13:43:59.295040'),(21,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 13:51:54.452223'),(22,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:00:53.976764'),(23,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:01:37.419006'),(24,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:01:43.093899'),(25,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:02:48.686041'),(26,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:15:18.794452'),(27,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 14:41:45.284716'),(28,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 16:30:49.007009'),(29,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 16:31:10.849454'),(30,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 16:33:32.061430'),(31,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 16:35:34.363882'),(32,1,2,'personalized','personalized',22.00,0,0,'2026-02-12 17:20:50.553642'),(33,2,2,'personalized','personalized',22.00,0,0,'2026-02-12 17:25:00.411279'),(34,2,2,'personalized','personalized',32.00,0,0,'2026-02-12 17:31:15.845269'),(35,2,2,'personalized','personalized',42.00,0,0,'2026-02-12 17:35:24.144378'),(36,1,2,'personalized','personalized',42.00,0,0,'2026-02-12 17:38:42.927943'),(37,1,2,'personalized','personalized',62.00,0,0,'2026-02-12 17:47:26.790189'),(38,1,2,'personalized','personalized',72.00,0,0,'2026-02-12 17:50:50.690880'),(39,2,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.143215'),(40,2,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.150138'),(41,2,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.155496'),(42,2,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.162295'),(43,2,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.166293'),(44,2,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.169909'),(45,2,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.175128'),(46,2,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.180379'),(47,2,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.184872'),(48,2,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.189205'),(49,2,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.193164'),(50,2,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.197965'),(51,2,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.201289'),(52,2,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.204133'),(53,2,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.207227'),(54,2,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.210663'),(55,2,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.215415'),(56,2,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.218375'),(57,2,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.221144'),(58,2,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:23:52.225287'),(59,2,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.440155'),(60,2,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.445569'),(61,2,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.451635'),(62,1,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.454430'),(63,2,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.455187'),(64,1,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.458184'),(65,2,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.459344'),(66,1,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.461658'),(67,2,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.462494'),(68,1,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.464798'),(69,2,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.465481'),(70,1,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.467300'),(71,2,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.468153'),(72,1,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.469962'),(73,2,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.470580'),(74,1,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.472714'),(75,2,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.473371'),(76,1,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.475321'),(77,2,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.476148'),(78,1,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.478703'),(79,2,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.479931'),(80,1,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.482917'),(81,2,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.483727'),(82,1,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.486083'),(83,2,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.487051'),(84,1,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.488897'),(85,2,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.489706'),(86,1,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.491508'),(87,2,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.492183'),(88,1,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.494462'),(89,2,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.495602'),(90,1,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.497609'),(91,2,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.498246'),(92,1,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.500469'),(93,2,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.501396'),(94,1,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.503472'),(95,2,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.504145'),(96,1,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.506231'),(97,1,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.508150'),(98,1,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:32:08.510624'),(99,2,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.740481'),(100,2,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.747860'),(101,2,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.754620'),(102,1,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.756770'),(103,2,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.758444'),(104,1,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.762052'),(105,2,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.763496'),(106,1,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.766081'),(107,2,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.766748'),(108,1,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.768619'),(109,2,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.769311'),(110,1,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.771278'),(111,2,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.771882'),(112,1,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.773825'),(113,2,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.775061'),(114,1,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.777980'),(115,2,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.778912'),(116,1,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.781789'),(117,2,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.782877'),(118,1,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.785659'),(119,2,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.786300'),(120,1,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.788463'),(121,2,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.789485'),(122,1,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.791967'),(123,2,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.793018'),(124,1,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.795891'),(125,2,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.797347'),(126,1,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.799940'),(127,2,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.800622'),(128,1,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.802967'),(129,2,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.803625'),(130,1,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.805775'),(131,2,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.806459'),(132,1,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.810314'),(133,2,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.811628'),(134,1,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.817476'),(135,2,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.818974'),(136,1,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.821959'),(137,1,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.826579'),(138,1,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:33:00.831370'),(139,2,33,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.442552'),(140,2,8,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.446536'),(141,2,29,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.451178'),(142,2,30,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.458568'),(143,2,24,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.463041'),(144,2,9,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.466564'),(145,2,35,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.469956'),(146,2,26,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.473500'),(147,2,15,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.475936'),(148,2,31,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.479790'),(149,2,25,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.484807'),(150,2,5,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.488935'),(151,2,3,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.494264'),(152,2,32,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.499356'),(153,2,18,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.501814'),(154,2,22,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.503999'),(155,2,7,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.508092'),(156,2,12,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.515366'),(157,2,14,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.522524'),(158,2,19,'personalized','personalized',1.00,0,0,'2026-02-12 21:34:05.526573'),(159,1,11,'personalized','personalized',11.65,0,0,'2026-02-13 23:35:54.385720'),(160,1,33,'personalized','personalized',11.65,0,0,'2026-02-13 23:35:54.399579'),(161,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.960390'),(162,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.962909'),(163,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.966713'),(164,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.971060'),(165,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.973378'),(166,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.975683'),(167,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.977445'),(168,2,12,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.979396'),(169,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.983186'),(170,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.987638'),(171,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.989874'),(172,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.991753'),(173,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.993410'),(174,2,18,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.994883'),(175,2,22,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:35.997356'),(176,2,9,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:36.001052'),(177,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:36.005521'),(178,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:36.010157'),(179,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:36.012360'),(180,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:36:36.017426'),(181,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.800565'),(182,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.803744'),(183,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.807248'),(184,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.811255'),(185,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.815874'),(186,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.818956'),(187,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.822681'),(188,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.827643'),(189,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.832980'),(190,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.839053'),(191,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.844656'),(192,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.850190'),(193,2,16,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.857009'),(194,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.862236'),(195,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.868114'),(196,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.874627'),(197,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.878541'),(198,2,6,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.885217'),(199,2,34,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.923332'),(200,2,20,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:06.932730'),(201,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.264712'),(202,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.268864'),(203,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.273798'),(204,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.277541'),(205,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.282359'),(206,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.285277'),(207,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.288440'),(208,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.290472'),(209,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.293253'),(210,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.299122'),(211,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.304816'),(212,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.310386'),(213,2,16,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.316236'),(214,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.319541'),(215,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.321867'),(216,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.323846'),(217,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.326933'),(218,2,6,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.332949'),(219,2,34,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.369426'),(220,2,20,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:09.376463'),(221,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.306744'),(222,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.309160'),(223,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.312182'),(224,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.314834'),(225,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.318274'),(226,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.321134'),(227,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.324321'),(228,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.328127'),(229,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.330942'),(230,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.335613'),(231,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.339199'),(232,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.342755'),(233,2,16,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.346705'),(234,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.353921'),(235,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.358766'),(236,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.361021'),(237,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.362919'),(238,2,6,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.365389'),(239,2,34,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.367372'),(240,2,20,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.370263'),(241,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.724650'),(242,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.727234'),(243,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.729947'),(244,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.732900'),(245,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.735784'),(246,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.738462'),(247,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.741402'),(248,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.744864'),(249,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.747158'),(250,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.749796'),(251,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.752107'),(252,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.755384'),(253,2,16,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.757219'),(254,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.758907'),(255,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.760645'),(256,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.762670'),(257,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.765003'),(258,2,6,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.767388'),(259,2,34,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.770709'),(260,2,20,'personalized','personalized',1.00,0,0,'2026-02-13 23:37:10.773160'),(261,2,26,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.775070'),(262,2,35,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.788339'),(263,2,24,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.819973'),(264,2,8,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.855247'),(265,2,29,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.883048'),(266,2,31,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.889564'),(267,2,3,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.894825'),(268,2,32,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.902217'),(269,2,15,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.906195'),(270,2,25,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.909993'),(271,2,5,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.913902'),(272,2,7,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.918174'),(273,2,16,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.921598'),(274,2,10,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.924625'),(275,2,30,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.928396'),(276,2,14,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.933285'),(277,2,19,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.938106'),(278,2,6,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.941198'),(279,2,34,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.944884'),(280,2,20,'personalized','personalized',1.00,0,0,'2026-02-13 23:38:01.947922');
/*!40000 ALTER TABLE `recommendation_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `orderId` int DEFAULT NULL,
  `rating` tinyint NOT NULL DEFAULT '5',
  `content` text COLLATE utf8mb4_unicode_ci,
  `images` json DEFAULT NULL,
  `helpfulCount` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_711cb665a4d4f8421265d92131` (`productId`,`userId`),
  KEY `FK_31db76b2d6dfe81d69e27b66c20` (`orderId`),
  KEY `FK_1337f93918c70837d3cea105d39` (`userId`),
  CONSTRAINT `FK_1337f93918c70837d3cea105d39` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_2a11d3c0ea1b2b5b1790f762b9a` FOREIGN KEY (`productId`) REFERENCES `fish_product` (`id`),
  CONSTRAINT `FK_31db76b2d6dfe81d69e27b66c20` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
INSERT INTO `review` VALUES (1,1,2,NULL,2,'涓€濉岀硦娑?,NULL,0,'2026-02-12 13:38:47.174488','2026-02-12 13:38:47.174488'),(2,1,33,NULL,4,'濂藉悆鐨勪笉寰椾簡锛屾柊椴滅殑寰?,NULL,0,'2026-02-13 23:36:19.807223','2026-02-13 23:36:19.807223'),(3,2,26,NULL,5,'瓒呯骇鏂伴矞濂藉悆',NULL,0,'2026-02-13 23:40:02.582057','2026-02-13 23:40:02.582057');
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `search_log`
--

DROP TABLE IF EXISTS `search_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `search_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `keyword` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `searchType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'keyword',
  `resultCount` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_761ccb243039a828af56eb9f82` (`created_at`),
  KEY `IDX_dd0dc139c1cdbe52882abb5172` (`userId`,`keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `search_log`
--

LOCK TABLES `search_log` WRITE;
/*!40000 ALTER TABLE `search_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `search_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
  UNIQUE KEY `IDX_8e1f623798118e629b46a9e629` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','$2b$10$5ktUooWCbLI4g4VDLBAo9.qUMCu2Qhf5qhxzeSCp.Py52e7Wh0W26','13800000000',NULL,NULL,NULL,'admin','2026-02-12 09:35:23.253822','2026-02-12 09:35:23.253822'),(2,'wuyueqian','$2b$10$aRhRNPHozuB8RFBcFd6E5egnrZvhsv0VyXe.Urud489Wxf6.w.3hK','13900000000',NULL,NULL,NULL,'user','2026-02-12 09:35:23.298447','2026-02-12 09:35:23.298447');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_behavior`
--

DROP TABLE IF EXISTS `user_behavior`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_behavior` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `behaviorType` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `behaviorValue` decimal(5,2) NOT NULL DEFAULT '1.00',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_1a87b134c2aa29f2c118040d96` (`userId`,`behaviorType`),
  KEY `IDX_5bcf74f9fedb8eccb4c45ba6ad` (`userId`,`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_behavior`
--

LOCK TABLES `user_behavior` WRITE;
/*!40000 ALTER TABLE `user_behavior` DISABLE KEYS */;
INSERT INTO `user_behavior` VALUES (1,1,2,'view',1.00,'2026-02-12 09:58:11.507267'),(2,2,2,'view',1.00,'2026-02-12 11:21:00.105245'),(3,2,2,'purchase',10.00,'2026-02-12 11:22:32.403578'),(4,1,2,'purchase',10.00,'2026-02-12 13:45:26.943823'),(5,2,2,'purchase',10.00,'2026-02-12 17:29:36.786335'),(6,2,2,'purchase',10.00,'2026-02-12 17:35:08.252161'),(7,1,2,'purchase',10.00,'2026-02-12 17:43:19.770988'),(8,1,2,'purchase',10.00,'2026-02-12 17:45:52.465020'),(9,1,2,'purchase',10.00,'2026-02-12 17:47:56.101059'),(10,1,2,'purchase',10.00,'2026-02-12 17:53:09.315241'),(11,1,2,'purchase',10.00,'2026-02-12 21:03:58.241191'),(12,2,33,'view',1.00,'2026-02-12 21:40:04.106334'),(13,2,11,'view',1.00,'2026-02-12 21:45:21.741517'),(14,1,33,'view',1.00,'2026-02-13 23:36:08.350182'),(15,2,17,'view',1.00,'2026-02-13 23:36:45.920446'),(16,2,26,'view',1.00,'2026-02-13 23:39:48.805172');
/*!40000 ALTER TABLE `user_behavior` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_coupon`
--

DROP TABLE IF EXISTS `user_coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_coupon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `couponId` int NOT NULL,
  `status` enum('unused','used','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unused',
  `orderId` int DEFAULT NULL,
  `usedAt` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_338ed60f788f4427ca609a622a` (`userId`,`couponId`),
  KEY `FK_183c6f34705a20750f83ea4e999` (`couponId`),
  KEY `FK_c7618c4a4106cfd9146193f9023` (`orderId`),
  CONSTRAINT `FK_183c6f34705a20750f83ea4e999` FOREIGN KEY (`couponId`) REFERENCES `coupon` (`id`),
  CONSTRAINT `FK_a0c3ed423523473ee2cc9c479ba` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_c7618c4a4106cfd9146193f9023` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_coupon`
--

LOCK TABLES `user_coupon` WRITE;
/*!40000 ALTER TABLE `user_coupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_coupon` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 14:11:07
