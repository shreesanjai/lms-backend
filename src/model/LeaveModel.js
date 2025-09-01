

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

    const res = await pool.query(` 
    SELECT 
            l.*,
            e.name AS employee_name,
            e.username AS employee_username,
            m.name AS manager_name,
            m.username AS manager_username,
            p.leavename AS leave_type
        FROM leave_request l
        JOIN employee e ON e.id = l.employee_id
        LEFT JOIN employee m ON m.id = e.reporting_manager_id
        LEFT JOIN policy p ON l.policy_id = p.id
        WHERE 
            l.employee_id = $1
        AND 
            l.status = 'pending';
    `, [id])
    return res.rows
}

const myUserPendingRequests = async (id) => {
    const res = await pool.query(`
       SELECT 
            lr.*,
            p.leavename,
            e.name,
            e.username
        FROM 
            leave_request lr
        LEFT JOIN 
            policy p ON lr.policy_id = p.id
        JOIN 
            employee e ON lr.employee_id = e.id
        WHERE 
            e.reporting_manager_id = $1 
        AND 
            lr.status = 'pending'
        `, [id])
    return res.rows
}

const statusUpdate = async (id, status) => {
    const res = await pool.query(`
        UPDATE 
            leave_request
        SET 
            status = $2
        WHERE
            id = $1 
        RETURNING *
            `, [id, status])
    return res.rows[0]
}

const leaveAvailabilityUpdate = async (employee_id, policy_id, availability) => {
    const res = await pool.query(`
        UPDATE 
            leave_availability
        SET 
            availability = $3
        WHERE 
            employee_id = $1 
        AND
            policy_id = $2
        RETURNING *
    `, [employee_id, policy_id, availability])
    return res.rows[0]
}

const getAvailability = async (employee_id, policy_id) => {
    const resp = await pool.query(`
        SELECT availability from leave_availability 
        WHERE 
        employee_id = $1 AND policy_id = $2
        `, [employee_id, policy_id])

    return resp.rows[0]
}


module.exports = {
    getPendingLeaveRequestByUserId,
    createLeaveRequest,
    myUserPendingRequests,
    statusUpdate,
    leaveAvailabilityUpdate,
    getAvailability
};