
const { pool } = require('../config/db')

const getAllHolidays = async (range) => {
    const res = await pool.query(`
        SELECT
            id,
            description,
            is_floater,
            to_char(date::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS date
        FROM holiday
        WHERE date BETWEEN $1 AND $2 
        ORDER BY date ASC;
`, [range.startDate, range.endDate])
    return res.rows
}

const getHolidayOnRange = async (range) => {
    const res = await pool.query("SELECT * FROM holiday WHERE is_floater != true AND date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

const getFloaterOnRange = async (range) => {
    const res = await pool.query("SELECT to_char(date::timestamptz AT TIME ZONE 'Asia/Calcutta', 'YYYY-MM-DD') AS date,is_floater from holiday WHERE is_floater = true AND date BETWEEN $1 AND $2", [range.startDate, range.endDate])
    return res.rows
}

const insertHolidayBulk = async (placeholder, values) => {
    const res = await pool.query(`INSERT INTO holiday(date,description,is_floater) VALUES ${placeholder} RETURNING *`, values)
    return res.rows
}

const insertHoliday = async (values) => {
    try {
        const res = await pool.query(`INSERT INTO holiday(date, description, is_floater) VALUES ($1, $2, $3) RETURNING *`, values)
        return "success"

    } catch (error) {
        return "error";
    }
}

const updateHoliday = async (values) => {
    try {
        const res = await pool.query(`
            UPDATE 
                holiday
            SET
                date = $1,
                description = $2,
                is_floater = $3
            WHERE 
                id = $4;
            `, [values.date, values.description, values.is_floater === true, values.id])
        return "success"

    } catch (error) {
        return "error";
    }
}

const deleteHoliday = async (values) => {
    try {
        const res = await pool.query(`
            DELETE FROM 
                holiday
            WHERE 
                id = $1
            RETURNING *;
            `, [values.id])

        if (res.rows)
            return "success"
        else
            return "error"

    } catch (error) {
        return "error";
    }
}

module.exports = { getHolidayOnRange, getFloaterOnRange, getAllHolidays, insertHolidayBulk, insertHoliday, updateHoliday, deleteHoliday }