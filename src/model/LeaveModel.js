

// models/LeaveModel.js
const { pool } = require("../config/db.js");


const createLeaveRequest = async (request) => {

    const result = await pool.query(`
            INSERT INTO leave_request (employee_id, startdate, enddate, status, no_of_days, notes, policy_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
            `, [request.employee_id, request.startDate, request.endDate, "pending", request.no_of_days, request.notes, request.policy_id])

    return result.rows[0]

}


const getPendingLeaveRequestByUserId = async (id) => {
    console.log(id);


    const res = await pool.query(` 
    SELECT 
        l.*,
        e.name AS employee_name,
        e.username AS employee_username,
        m.name AS manager_name,
        m.username AS manager_username,
        p.leavename AS leave_type
        FROM leave_request l
        JOIN employee e 
        ON e.id = l.employee_id
        LEFT JOIN employee m 
        ON m.id = e.reporting_manager_id
        LEFT JOIN policy p
        ON l.policy_id = p.id
        WHERE l.employee_id = $1
        AND l.status = 'pending';
    `, [id])
    return res.rows
}



module.exports = { getPendingLeaveRequestByUserId, createLeaveRequest };