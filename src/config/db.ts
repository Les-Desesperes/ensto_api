import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE as string,
    process.env.MYSQL_USER as string,
    process.env.MYSQL_PASSWORD as string, // FIXED: use MYSQL_PASSWORD, not MYSQL_ROOT_PASSWORD
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        port: Number(process.env.MYSQL_PORT) || 3306,
        logging: false, // Change to console.log to see the generated SQL queries
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default sequelize;