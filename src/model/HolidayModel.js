
const { pool } = require('../config/db')

const getAllHolidays = async (range) => {
    const res = await pool.query("SELECT * FROM holiday WHERE date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

const getHolidayOnRange = async (range) => {
    const res = await pool.query("SELECT * FROM holiday WHERE is_floater != true AND date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

const getFloaterOnRange = async (range) => {
    const res = await pool.query("SELECT date,is_floater from holiday WHERE is_floater = true AND date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

module.exports = { getHolidayOnRange, getFloaterOnRange, getAllHolidays }