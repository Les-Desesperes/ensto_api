-- Disable foreign key checks to prevent dependency errors during bulk operations
SET
FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Mock Data for Employees (Personnel)
-- --------------------------------------------------------
DELETE
FROM `employees`;
ALTER TABLE `employees` AUTO_INCREMENT = 1;

INSERT INTO `employees` (`employee_id`, `username`, `password_hash`, `role`)
VALUES (1, 'jdupont_admin', SHA2('Admin123!', 256), 'Admin'),
       (2, 'mlefevre_wh', SHA2('Worker123!', 256), 'WarehouseWorker'),
       (3, 'aleroi_wh', SHA2('Worker123!', 256), 'WarehouseWorker');

-- --------------------------------------------------------
-- 2. Mock Data for Delivery Drivers (Livreurs)
-- --------------------------------------------------------
DELETE
FROM `delivery_drivers`;
ALTER TABLE `delivery_drivers` AUTO_INCREMENT = 1;

INSERT INTO `delivery_drivers` (`driver_id`, `encrypted_last_name`, `encrypted_first_name`, `company`,
                                `ppe_charter_valid`, `ppe_signature_date`)
VALUES (1, 'e3b0c44298fc1c149afbf4c8996fb924:e3b0c44298fc1c14', 'e3b0c44298fc1c149afbf4c8996fb924:8a2f3b',
        'Fast Logistics', 1, '2023-10-01 08:30:00'),
       (2, 'a1b2c3d4e5f678901234567890abcdef:c4d5e6f7a8b9', 'a1b2c3d4e5f678901234567890abcdef:1a2b3c', 'Global Freight',
        1, '2023-11-15 09:00:00'),
       (3, 'f1e2d3c4b5a69876543210fedcba0987:9f8e7d', 'f1e2d3c4b5a69876543210fedcba0987:6c5b4a', 'Local Transports', 0,
        NULL);

-- --------------------------------------------------------
-- 3. Mock Data for Vehicles (Véhicules)
-- --------------------------------------------------------
DELETE
FROM `vehicles`;
ALTER TABLE `vehicles` AUTO_INCREMENT = 1;

INSERT INTO `vehicles` (`vehicle_id`, `license_plate`, `vehicle_type`, `driverId`)
VALUES (1, 'AA-123-BB', 'LCV', 1),
       (2, 'CD-456-EF', 'HGV', 2),
       (3, 'GH-789-IJ', 'LCV', 3),
       (4, 'KL-012-MN', 'HGV', 1);

-- --------------------------------------------------------
-- 4. Mock Data for Visitors (Visiteurs)
-- --------------------------------------------------------
DELETE
FROM `visitors`;
ALTER TABLE `visitors` AUTO_INCREMENT = 1;

INSERT INTO `visitors` (`visitor_id`, `full_name`, `company`, `arrival_time`)
VALUES (1, 'Sophie Martin', 'Tech Solutions', '2023-12-01 10:15:00'),
       (2, 'Lucas Bernard', 'Maintenance Corp', '2023-12-01 14:00:00'),
       (3, 'Emma Petit', 'Audit Partners', '2023-12-02 09:00:00');

-- --------------------------------------------------------
-- 5. Mock Data for History Logs (Historique_Log)
-- --------------------------------------------------------
DELETE
FROM `history_logs`;
ALTER TABLE `history_logs` AUTO_INCREMENT = 1;

INSERT INTO `history_logs` (`log_id`, `date_time`, `action_type`, `details`, `employeeId`, `vehicleId`, `driverId`,
                            `visitorId`)
VALUES (1, '2023-12-01 08:00:00', 'Entry', 'Routine delivery scan', 2, 1, 1, NULL),
       (2, '2023-12-01 08:45:00', 'Exit', 'Delivery completed', 2, 1, 1, NULL),
       (3, '2023-12-01 10:15:00', 'Entry', 'Meeting with management', 1, NULL, NULL, 1),
       (4, '2023-12-01 11:00:00', 'Refusal', 'PPE charter not signed by driver', 3, 3, 3, NULL),
       (5, '2023-12-01 12:30:00', 'Exit', 'Meeting finished', 1, NULL, NULL, 1);

-- Re-enable foreign key checks
SET
FOREIGN_KEY_CHECKS = 1;