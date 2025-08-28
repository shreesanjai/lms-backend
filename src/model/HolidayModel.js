
const { pool } = require('../config/db')

const getHolidayOnRange = async (range) => {
    const res = await pool.query("SELECT * FROM holiday WHERE date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

module.exports = { getHolidayOnRange }