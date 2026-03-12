import app from './app';

import {EnstoDatabase, sequelize} from "@les-desesperes/ensto-db";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    const db = new EnstoDatabase({
        connection: {
            database: process.env.MYSQL_DATABASE,
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT) || 3306,
            logging: false,
            dialect: 'mysql',
        },
    });

    try {

        await db.authenticate();
        console.log('✅ Connected to MySQL database.');

        await db.sync({ alter: true });
        db.initDefaultModels()
        console.log('✅ All database tables synchronized.');

        // 3. Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
        });
    } catch (error) {
        await db.close();
        console.error('❌ Failed to start the server or sync database:', error);
        process.exit(1);
    }
};

startServer();