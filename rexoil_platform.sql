-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1:3306
-- Üretim Zamanı: 06 Ara 2024, 08:04:18
-- Sunucu sürümü: 8.0.31
-- PHP Sürümü: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `rexoil_platform`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `adresler`
--

DROP TABLE IF EXISTS `adresler`;
CREATE TABLE IF NOT EXISTS `adresler` (
  `adres_id` int NOT NULL,
  `adres_adi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `telefon_no` int NOT NULL,
  PRIMARY KEY (`adres_id`),
  KEY `idx_adres_id` (`adres_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `akaryakit_ist`
--

DROP TABLE IF EXISTS `akaryakit_ist`;
CREATE TABLE IF NOT EXISTS `akaryakit_ist` (
  `akaryakit_ist_id` int NOT NULL,
  `sehir_id` int NOT NULL,
  `akaryakit_ist_adi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `adres_id` int DEFAULT NULL,
  `lat` int NOT NULL,
  `lng` int NOT NULL,
  PRIMARY KEY (`akaryakit_ist_id`),
  KEY `idx_adres_id` (`adres_id`),
  KEY `fk_akaryakit_sehir` (`sehir_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `akaryakit_ist`
--

INSERT INTO `akaryakit_ist` (`akaryakit_ist_id`, `sehir_id`, `akaryakit_ist_adi`, `adres_id`, `lat`, `lng`) VALUES
(1, 1, 'opet', NULL, 33, 38);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `oteller`
--

DROP TABLE IF EXISTS `oteller`;
CREATE TABLE IF NOT EXISTS `oteller` (
  `otel_id` int NOT NULL,
  `sehir_id` int NOT NULL,
  `otel_adi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `adres_id` int DEFAULT NULL,
  `otel_turu` int NOT NULL,
  `lat` int NOT NULL,
  `lng` int NOT NULL,
  PRIMARY KEY (`otel_id`),
  KEY `idx_adres_id` (`adres_id`),
  KEY `fk_oteller_sehir` (`sehir_id`),
  KEY `idx_adres` (`adres_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `oteller`
--

INSERT INTO `oteller` (`otel_id`, `sehir_id`, `otel_adi`, `adres_id`, `otel_turu`, `lat`, `lng`) VALUES
(1, 1, 'X', NULL, 1, 33, 40),
(2, 1, 'movenpik', NULL, 2, 38, 27);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `personeller`
--

DROP TABLE IF EXISTS `personeller`;
CREATE TABLE IF NOT EXISTS `personeller` (
  `personel_id` int NOT NULL,
  `ad` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `soyad` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `telefon_no` int NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `sehir_id` int DEFAULT NULL,
  `satis_nokta_id` int NOT NULL,
  `rezerve_edln_otel_id` int NOT NULL,
  `rezerve_edln_rest_id` int NOT NULL,
  `rezerve_edln_akarykt_id` int NOT NULL,
  `password` int NOT NULL,
  PRIMARY KEY (`personel_id`),
  KEY `idx_sehir_id` (`sehir_id`),
  KEY `idx_personel_id` (`personel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `personeller`
--

INSERT INTO `personeller` (`personel_id`, `ad`, `soyad`, `telefon_no`, `email`, `sehir_id`, `satis_nokta_id`, `rezerve_edln_otel_id`, `rezerve_edln_rest_id`, `rezerve_edln_akarykt_id`, `password`) VALUES
(1, 'G', 'G', 0, 'g', NULL, 0, 0, 0, 0, 123);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `restoranlar`
--

DROP TABLE IF EXISTS `restoranlar`;
CREATE TABLE IF NOT EXISTS `restoranlar` (
  `restoran_id` int NOT NULL,
  `restoran_adi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `sehir_id` int NOT NULL,
  `adres_id` int DEFAULT NULL,
  `lat` int NOT NULL,
  `lng` int NOT NULL,
  PRIMARY KEY (`restoran_id`),
  KEY `fk_restoran_adres` (`adres_id`),
  KEY `idx_sehir_id` (`sehir_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `restoranlar`
--

INSERT INTO `restoranlar` (`restoran_id`, `restoran_adi`, `sehir_id`, `adres_id`, `lat`, `lng`) VALUES
(1, 'KFC', 1, NULL, 36, 30);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `rezervasyon`
--

DROP TABLE IF EXISTS `rezervasyon`;
CREATE TABLE IF NOT EXISTS `rezervasyon` (
  `rezervasyon_id` int NOT NULL AUTO_INCREMENT,
  `otel_id` int NOT NULL,
  `personel_id` int NOT NULL,
  `giris_tarihi` int NOT NULL,
  `cikis_tarihi` int NOT NULL,
  PRIMARY KEY (`rezervasyon_id`),
  KEY `idx_personel_id` (`personel_id`),
  KEY `idx_otel_id` (`otel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `rezervasyon`
--

INSERT INTO `rezervasyon` (`rezervasyon_id`, `otel_id`, `personel_id`, `giris_tarihi`, `cikis_tarihi`) VALUES
(1, 1, 1, 2024, 2024),
(2, 2, 1, 2024, 2024),
(3, 1, 1, 2024, 2024),
(4, 2, 1, 2024, 2024);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `satis_noktalari`
--

DROP TABLE IF EXISTS `satis_noktalari`;
CREATE TABLE IF NOT EXISTS `satis_noktalari` (
  `satis_nokta_id` int NOT NULL,
  `sehir_id` int DEFAULT NULL,
  `satis_nokta_adi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `adres_id` int DEFAULT NULL,
  `personel_id` int DEFAULT NULL,
  `lat` int NOT NULL,
  `lng` int NOT NULL,
  PRIMARY KEY (`satis_nokta_id`),
  KEY `sehir_id` (`sehir_id`),
  KEY `adres_id` (`adres_id`),
  KEY `idx_sehir_id` (`sehir_id`),
  KEY `idx_personel_id` (`personel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `satis_noktalari`
--

INSERT INTO `satis_noktalari` (`satis_nokta_id`, `sehir_id`, `satis_nokta_adi`, `adres_id`, `personel_id`, `lat`, `lng`) VALUES
(1, 1, 'y', NULL, NULL, 40, 33),
(2, 1, 'sfsf', NULL, NULL, 37, 32);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `sehirler`
--

DROP TABLE IF EXISTS `sehirler`;
CREATE TABLE IF NOT EXISTS `sehirler` (
  `sehir_id` int NOT NULL,
  `sehir_adi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `bolge` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci NOT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  PRIMARY KEY (`sehir_id`),
  KEY `idx_sehir_id_new` (`sehir_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `sehirler`
--

INSERT INTO `sehirler` (`sehir_id`, `sehir_adi`, `bolge`, `lat`, `lng`) VALUES
(1, 'izmir', '1', NULL, NULL),
(2, 'Ankara', '2', NULL, NULL);

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `akaryakit_ist`
--
ALTER TABLE `akaryakit_ist`
  ADD CONSTRAINT `fk_akaryakit_ist_adres` FOREIGN KEY (`adres_id`) REFERENCES `adresler` (`adres_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_akaryakit_sehir` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Tablo kısıtlamaları `oteller`
--
ALTER TABLE `oteller`
  ADD CONSTRAINT `fk_oteller_adres` FOREIGN KEY (`adres_id`) REFERENCES `adresler` (`adres_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oteller_sehir` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Tablo kısıtlamaları `personeller`
--
ALTER TABLE `personeller`
  ADD CONSTRAINT `fk_personel_sehir` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Tablo kısıtlamaları `restoranlar`
--
ALTER TABLE `restoranlar`
  ADD CONSTRAINT `fk_restoran_adres` FOREIGN KEY (`adres_id`) REFERENCES `adresler` (`adres_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `restoranlar_ibfk_1` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Tablo kısıtlamaları `rezervasyon`
--
ALTER TABLE `rezervasyon`
  ADD CONSTRAINT `fk_otel_id` FOREIGN KEY (`otel_id`) REFERENCES `oteller` (`otel_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personel_rezervasyon` FOREIGN KEY (`personel_id`) REFERENCES `personeller` (`personel_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Tablo kısıtlamaları `satis_noktalari`
--
ALTER TABLE `satis_noktalari`
  ADD CONSTRAINT `fk_personel_id` FOREIGN KEY (`personel_id`) REFERENCES `personeller` (`personel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_satis_noktalari_adres` FOREIGN KEY (`adres_id`) REFERENCES `adresler` (`adres_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_satis_sehir_id` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sehir_id` FOREIGN KEY (`sehir_id`) REFERENCES `sehirler` (`sehir_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
