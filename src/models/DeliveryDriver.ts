import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import {decryptAES, encryptAES} from "@/utils/crypto";

interface DeliveryDriverAttributes {
    driverId: number;
    encryptedLastName: string;
    encryptedFirstName: string;
    company: string;
    ppeCharterValid: boolean; // PPE = Personal Protective Equipment (EPI in French)
    ppeSignatureDate: Date | null;
}

interface DeliveryDriverCreationAttributes extends Optional<DeliveryDriverAttributes, 'driverId'> {}

class DeliveryDriver extends Model<DeliveryDriverAttributes, DeliveryDriverCreationAttributes> implements DeliveryDriverAttributes {
    public driverId!: number;
    public encryptedLastName!: string;
    public encryptedFirstName!: string;
    public company!: string;
    public ppeCharterValid!: boolean;
    public ppeSignatureDate!: Date | null;
}

DeliveryDriver.init(
    {
        driverId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            field: 'driver_id',
        },
        encryptedLastName: {
            type: DataTypes.STRING, // Constraint FC1: Needs AES-256 encryption before insert
            allowNull: false,
            field: 'encrypted_last_name',
        },
        encryptedFirstName: {
            type: DataTypes.STRING, // Constraint FC1: Needs AES-256 encryption before insert
            allowNull: false,
            field: 'encrypted_first_name',
        },
        company: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ppeCharterValid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'ppe_charter_valid',
        },
        ppeSignatureDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'ppe_signature_date',
        },
    },
    {
        sequelize,
        tableName: 'delivery_drivers',
        timestamps: false,
        hooks: {
            // Encrypt before inserting or updating
            beforeSave: (driver: DeliveryDriver) => {
                if (driver.changed('encryptedFirstName')) {
                    driver.encryptedFirstName = encryptAES(driver.encryptedFirstName);
                }
                if (driver.changed('encryptedLastName')) {
                    driver.encryptedLastName = encryptAES(driver.encryptedLastName);
                }
            },
            // Decrypt automatically when querying the database
            afterFind: (result: DeliveryDriver | DeliveryDriver[] | null) => {
                if (!result) return;

                if (Array.isArray(result)) {
                    result.forEach(driver => {
                        driver.encryptedFirstName = decryptAES(driver.encryptedFirstName);
                        driver.encryptedLastName = decryptAES(driver.encryptedLastName);
                    });
                } else {
                    result.encryptedFirstName = decryptAES(result.encryptedFirstName);
                    result.encryptedLastName = decryptAES(result.encryptedLastName);
                }
            },
        },
    }
);

export default DeliveryDriver;