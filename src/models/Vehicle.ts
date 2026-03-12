import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface VehicleAttributes {
    vehicleId: number;
    licensePlate: string;
    vehicleType: 'HGV' | 'LCV'; // HGV = Heavy Goods Vehicle (PL), LCV = Light Commercial Vehicle (VUL)
    driverId?: number; // Foreign Key
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'vehicleId'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
    public vehicleId!: number;
    public licensePlate!: string;
    public vehicleType!: 'HGV' | 'LCV';
    public driverId!: number;
}

Vehicle.init(
    {
        vehicleId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            field: 'vehicle_id',
        },
        licensePlate: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'license_plate',
        },
        vehicleType: {
            type: DataTypes.ENUM('HGV', 'LCV'),
            allowNull: false,
            field: 'vehicle_type',
        },
    },
    {
        sequelize,
        tableName: 'vehicles',
        timestamps: false,
    }
);

export default Vehicle;