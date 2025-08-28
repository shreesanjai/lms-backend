const { pool } = require("../config/db")


const getAllPolicybyUserId = async (id) => {
    const resp = await pool.query("SELECT p.id, p.leavename from policy p left join leave_availability l on p.id = l.policy_id WHERE l.employee_id = $1", [id])
    return resp.rows;
}

module.exports = { getAllPolicybyUserId }