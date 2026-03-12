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
VALUES (1, '8cbba7846532d3c9c69ad50a3b741f6b:741c7562a344681890a1c4d002d485f1', '8055ea4e8d6c8b4ecc3c51bcca34e91c:e306f69ae41f788f282d45f639566ca0',
        'Fast Logistics', 1, '2023-10-01 08:30:00'),
       (2, 'baf4fb538356b8aa4e4e5519e7f14faf:66037dbdb4867e842c49e685a3f22ddf', 'c30686cc406c2529371406777594ebf8:850006fd03d1f3fdcfc1d08a058d7d65', 'Global Freight',
        1, '2023-11-15 09:00:00'),
       (3, '82e3c7a7acc1a0f94c9adadb52ae06fb:400e014b579d606012a5491d1f959689', '1506a6915f7437ddbabb76e566687af7:5d0fe549a2151d84a3d9f11141c6faae', 'Local Transports', 0,
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