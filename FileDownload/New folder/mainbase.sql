-- phpMyAdmin SQL Dump
-- version 4.8.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 11, 2019 at 11:07 AM
-- Server version: 10.1.33-MariaDB
-- PHP Version: 7.2.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `game_data`
--

-- --------------------------------------------------------

--
-- Table structure for table `mainbase`
--

CREATE TABLE `mainbase` (
  `Level` int(2) NOT NULL,
  `MightBonus` int(5) DEFAULT NULL,
  `FoodCost` int(7) DEFAULT NULL,
  `WoodCost` int(7) DEFAULT NULL,
  `StoneCost` int(7) DEFAULT NULL,
  `MetalCost` int(6) DEFAULT NULL,
  `TimeMin` varchar(13) DEFAULT NULL,
  `TimeInt` int(8) DEFAULT NULL,
  `Required` varchar(10) DEFAULT NULL,
  `Unlock` varchar(10) DEFAULT NULL,
  `Unlock_ID` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `mainbase`
--

INSERT INTO `mainbase` (`Level`, `MightBonus`, `FoodCost`, `WoodCost`, `StoneCost`, `MetalCost`, `TimeMin`, `TimeInt`, `Required`, `Unlock`, `Unlock_ID`) VALUES
(1, 40, 560, 700, 1120, 420, '0:03:00', 20, '', '', 0),
(2, 80, 840, 1060, 1680, 640, '0:06:00', 360, '', 'Infantry', 15),
(3, 100, 1260, 1580, 2520, 940, '3:12:00', 11520, '', '', 0),
(4, 160, 1900, 2360, 3780, 1420, '6:24:00', 23040, '', '', 0),
(5, 220, 2840, 3540, 5680, 2120, '11:31:12', 41472, '', '', 0),
(6, 300, 4260, 5320, 8500, 3180, '23:57:42', 86262, '', '', 0),
(7, 420, 6380, 7980, 12760, 4780, '1d 3:33:22', 99202, '', '', 0),
(8, 580, 9560, 11960, 19140, 7180, '1d 7:41:22', 114082, '', '', 0),
(9, 820, 14360, 17940, 28700, 10760, '2d 12:26:34', 217594, '', '', 0),
(10, 1140, 21520, 26920, 43060, 16140, '3d 17:54:34', 323674, '', '', 0),
(11, 1600, 32300, 40360, 64580, 24220, '5d 0:11:44', 432704, '', '', 0),
(12, 2240, 48440, 60540, 96880, 36320, '7d 7:25:32', 631532, '', '', 0),
(13, 3120, 72660, 90820, 145320, 54500, '10d 13:20:00', 912000, '', '', 0),
(14, 4380, 108980, 136240, 217980, 81740, '12d 1:18:00', 1041480, '', '', 0),
(15, 6120, 163480, 204360, 326960, 122620, '15d 5:16:00', 1314960, '', '', 0),
(16, 8580, 245220, 306520, 490440, 183920, '17d 9:21:00', 1502460, '', '', 0),
(17, 12000, 367840, 459780, 735660, 275880, '20d 5:21:00', 1747260, '', '', 0),
(18, 16800, 551740, 689680, 1103500, 413800, '24d 3:35:48', 2086548, '', '', 0),
(19, 23520, 827620, 1034520, 1655240, 620720, '52d 16:04:00', 4550640, '', '', 0),
(20, 32900, 1241420, 1551760, 2482860, 931040, '156d 20:15:30', 13551330, '', '', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `mainbase`
--
ALTER TABLE `mainbase`
  ADD PRIMARY KEY (`Level`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `mainbase`
--
ALTER TABLE `mainbase`
  MODIFY `Level` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
