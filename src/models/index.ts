import Employee from './Employee';
import DeliveryDriver from './DeliveryDriver';
import Vehicle from './Vehicle';
import Visitor from './Visitor';
import HistoryLog from './HistoryLog';

// --- DeliveryDriver <-> Vehicle (1 to Many) ---
DeliveryDriver.hasMany(Vehicle, { foreignKey: 'driverId' });
Vehicle.belongsTo(DeliveryDriver, { foreignKey: 'driverId' });

// --- Employee <-> HistoryLog (1 to Many) ---
Employee.hasMany(HistoryLog, { foreignKey: 'employeeId' });
HistoryLog.belongsTo(Employee, { foreignKey: 'employeeId' });

// --- Vehicle <-> HistoryLog (1 to Many) ---
Vehicle.hasMany(HistoryLog, { foreignKey: 'vehicleId' });
HistoryLog.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

// --- DeliveryDriver <-> HistoryLog (1 to Many) ---
DeliveryDriver.hasMany(HistoryLog, { foreignKey: 'driverId' });
HistoryLog.belongsTo(DeliveryDriver, { foreignKey: 'driverId' });

// --- Visitor <-> HistoryLog (1 to Many) ---
Visitor.hasMany(HistoryLog, { foreignKey: 'visitorId' });
HistoryLog.belongsTo(Visitor, { foreignKey: 'visitorId' });

export {
    Employee,
    DeliveryDriver,
    Vehicle,
    Visitor,
    HistoryLog,
};