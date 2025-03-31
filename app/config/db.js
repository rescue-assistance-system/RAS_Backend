import { Sequelize } from "sequelize";
import dbConfig from "./database.js"; // Import config

const sequelize = new Sequelize(
    dbConfig.production.database,
    dbConfig.production.username,
    dbConfig.production.password,
    {
        host: dbConfig.production.host,
        port: dbConfig.production.port,
        dialect: dbConfig.production.dialect,
        dialectOptions: dbConfig.production.dialectOptions,
        pool: dbConfig.production.pool
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối Supabase thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối:", error);
    }
}

testConnection();

export default sequelize;
