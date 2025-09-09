const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

let pool;

function createPool() {
    pool = new Pool({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        database: process.env.PG_DATABASE,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });

    pool.on("connect", () => {
        console.log("Connected to " + process.env.PG_HOST + " " + new Date());
    });

    pool.on("error", (err) => {
        console.error("Unexpected DB error:", err);

        if (err.code === "ECONNRESET" || err.code === "57P01" || err.code === "ENOTFOUND") {
            console.log("Reconnecting...");
            recreatePool();
        }
    });
}

function recreatePool() {
    console.log("Recreate Pool");

    pool.end().catch(() => { });
    setTimeout(() => {
        createPool();
    }, 3000);
}

createPool();

module.exports = { pool };
