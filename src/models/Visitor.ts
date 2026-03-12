import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface VisitorAttributes {
    visitorId: number;
    fullName: string;
    company: string;
    arrivalTime: Date;
}

interface VisitorCreationAttributes extends Optional<VisitorAttributes, 'visitorId'> {}

class Visitor extends Model<VisitorAttributes, VisitorCreationAttributes> implements VisitorAttributes {
    public visitorId!: number;
    public fullName!: string;
    public company!: string;
    public arrivalTime!: Date;
}

Visitor.init(
    {
        visitorId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            field: 'visitor_id',
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'full_name',
        },
        company: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        arrivalTime: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'arrival_time',
        },
    },
    {
        sequelize,
        tableName: 'visitors',
        timestamps: false,
    }
);

export default Visitor;