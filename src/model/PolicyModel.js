const { pool } = require("../config/db")


const getAllPolicybyUserId = async (id) => {
    const resp = await pool.query(`
        SELECT 
            p.id, 
            p.leavename,
            l.availability,
            p.applicationrule,
            p.notes
        FROM 
            policy p 
        LEFT JOIN 
            leave_availability l ON p.id = l.policy_id 
        WHERE 
            l.employee_id = $1`
        , [id])
    return resp.rows;
}

const getPolicyByInterval = async (intervals) => {

    const resp = await pool.query(`
        SELECT 
            id, rolloverlimit, rollover, accural_quantity, leavename
        FROM 
            policy
        WHERE 
            accural_interval = ANY($1)
        `, [intervals])
    return resp.rows
}

module.exports = { getAllPolicybyUserId, getPolicyByInterval }