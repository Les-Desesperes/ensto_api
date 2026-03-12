import app from './app';
import sequelize from './config/db';

// Crucial: Import the models index so relationships are established BEFORE syncing
import './models';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Test the database connection
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL database.');

        // 2. Synchronize models with the database
        // alter: true will safely update existing tables to match your models without dropping them
        await sequelize.sync({ alter: true });
        console.log('✅ All database tables synchronized.');

        // 3. Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start the server or sync database:', error);
        process.exit(1);
    }
};

startServer();