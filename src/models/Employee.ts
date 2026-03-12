import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import {hashSHA256} from "@/utils/crypto";

interface EmployeeAttributes {
    employeeId: number;
    username: string;
    passwordHash: string;
    role: 'Admin' | 'WarehouseWorker';
}

interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'employeeId'> {}

class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
    public employeeId!: number;
    public username!: string;
    public passwordHash!: string;
    public role!: 'Admin' | 'WarehouseWorker';
}

Employee.init(
    {
        employeeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            field: 'employee_id',
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING, // NOTE: Needs SHA-256 hashing before insert
            allowNull: false,
            field: 'password_hash',
        },
        role: {
            type: DataTypes.ENUM('Admin', 'WarehouseWorker'), // Translated from Admin/Magasinier
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'employees',
        timestamps: false,
        hooks: {
            beforeCreate: (employee: Employee) => {
                if (employee.passwordHash) {
                    employee.passwordHash = hashSHA256(employee.passwordHash);
                }
            },
            beforeUpdate: (employee: Employee) => {
                if (employee.changed('passwordHash')) {
                    employee.passwordHash = hashSHA256(employee.passwordHash);
                }
            },
        },
    }
);

export default Employee;