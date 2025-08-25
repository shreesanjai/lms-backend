const { Pool } = require("pg");

const dotenv = require('dotenv')
dotenv.config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,

});

pool.connect()
    .then(() => console.log("Connected to "+process.env.PG_HOST))
    .catch((err) => console.log("Not Connected : ", err))

module.exports = {pool};