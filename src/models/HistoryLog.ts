import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface HistoryLogAttributes {
    logId: number;
    dateTime: Date;
    actionType: 'Entry' | 'Exit' | 'Refusal';
    details: string;

    // Foreign Keys (Nullable since a log might pertain to only one of these at a time)
    employeeId?: number;
    vehicleId?: number;
    driverId?: number;
    visitorId?: number;
}

interface HistoryLogCreationAttributes extends Optional<HistoryLogAttributes, 'logId'> {}

class HistoryLog extends Model<HistoryLogAttributes, HistoryLogCreationAttributes> implements HistoryLogAttributes {
    public logId!: number;
    public dateTime!: Date;
    public actionType!: 'Entry' | 'Exit' | 'Refusal';
    public details!: string;
}

HistoryLog.init(
    {
        logId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            field: 'log_id',
        },
        dateTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'date_time',
        },
        actionType: {
            type: DataTypes.ENUM('Entry', 'Exit', 'Refusal'),
            allowNull: false,
            field: 'action_type',
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'history_logs',
        timestamps: false,
        // Constraint FC2: Table partitioning by year should be handled via a raw SQL migration.
    }
);

export default HistoryLog;