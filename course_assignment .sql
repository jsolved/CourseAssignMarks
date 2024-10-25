-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2024 at 07:56 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `course_assignment`
--

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `courseCode` varchar(10) NOT NULL,
  `courseName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`courseCode`, `courseName`) VALUES
('GDES 901', 'Personal Hygiene'),
('GDES 902', 'ALGORITHMS'),
('GDES 903', 'MATHS'),
('GDES 905', 'APPLIED DATABASES'),
('GDES 906', 'APPLIED RESEARCH'),
('GDES 907', 'JAVASCRIPTS MASTERY'),
('GDES 909', 'PC REPAIR'),
('GDES 911', 'PROMISES ACTIONS'),
('GDES904', 'PROGRAMING CONCEPTS');

-- --------------------------------------------------------

--
-- Table structure for table `marks`
--

CREATE TABLE `marks` (
  `matric` varchar(10) NOT NULL,
  `courseCode` varchar(10) NOT NULL,
  `courseWork` decimal(5,2) NOT NULL,
  `finalExam` decimal(5,2) NOT NULL,
  `totalMark` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `marks`
--

INSERT INTO `marks` (`matric`, `courseCode`, `courseWork`, `finalExam`, `totalMark`) VALUES
('PG/24/0064', 'GDES 901', '45.60', '45.40', '91.00'),
('PG/24/0066', 'GDES 901', '45.60', '45.40', '91.00');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `matric` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `nationality` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`matric`, `name`, `nationality`) VALUES
('PG/24/0064', 'Mugerwa Joseph', 'Ugandan'),
('PG/24/0065', 'Andrew Olamidde', 'Nigeria'),
('PG/24/0066', 'Kato Daniel', 'Ugandan'),
('PG/24/0067', 'Lubwama Pius', 'Kenyan'),
('PG/24/0068', 'Brazilian Dem', 'Brazil'),
('PG/24/0069', 'James Andrews', 'America');

-- --------------------------------------------------------

--
-- Table structure for table `takes`
--

CREATE TABLE `takes` (
  `matric` varchar(10) NOT NULL,
  `courseCode` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `takes`
--

INSERT INTO `takes` (`matric`, `courseCode`) VALUES
('PG/24/0064', 'GDES 901'),
('PG/24/0064', 'GDES 902'),
('PG/24/0064', 'GDES 903'),
('PG/24/0064', 'GDES904'),
('PG/24/0065', 'GDES 902'),
('PG/24/0065', 'GDES 903'),
('PG/24/0066', 'GDES 901'),
('PG/24/0066', 'GDES 902');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`courseCode`);

--
-- Indexes for table `marks`
--
ALTER TABLE `marks`
  ADD PRIMARY KEY (`matric`,`courseCode`),
  ADD KEY `Foreign-2` (`courseCode`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`matric`);

--
-- Indexes for table `takes`
--
ALTER TABLE `takes`
  ADD PRIMARY KEY (`matric`,`courseCode`),
  ADD KEY `courseCode` (`courseCode`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `marks`
--
ALTER TABLE `marks`
  ADD CONSTRAINT `Foreign-1` FOREIGN KEY (`matric`) REFERENCES `student` (`matric`),
  ADD CONSTRAINT `Foreign-2` FOREIGN KEY (`courseCode`) REFERENCES `course` (`courseCode`);

--
-- Constraints for table `takes`
--
ALTER TABLE `takes`
  ADD CONSTRAINT `takes_ibfk_1` FOREIGN KEY (`matric`) REFERENCES `student` (`matric`),
  ADD CONSTRAINT `takes_ibfk_2` FOREIGN KEY (`courseCode`) REFERENCES `course` (`courseCode`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
