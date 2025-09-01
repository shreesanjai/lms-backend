const { pool } = require("../config/db")


const getAllPolicybyUserId = async (id) => {
    const resp = await pool.query(`
        SELECT 
            p.id, 
            p.leavename,
            l.availability,
            p.applicationrule
        FROM 
            policy p 
        LEFT JOIN 
            leave_availability l ON p.id = l.policy_id 
        WHERE 
            l.employee_id = $1`
        , [id])
    return resp.rows;
}

module.exports = { getAllPolicybyUserId }