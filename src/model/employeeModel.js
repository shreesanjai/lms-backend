
// models/EmployeeModel.js
const { pool } = require("../config/db.js");

// Get all users
const getAllUsers = async () => {
    const result = await pool.query("SELECT id,username,name,role,reporting_manager_id FROM employee");
    return result.rows;
};

// Get user by ID
const getUserByUsername = async (id) => {

    const result = await pool.query("SELECT id,username,name,role,password FROM employee WHERE username = $1", [id]);
    return result.rows[0];
};

//Create User
const createUser = async (user) => {
    const result = await pool.query(`
        INSERT INTO employee(username, name, department, role, password, reporting_manager_id)
        VALUES
        ($1, $2, $3, $4, $5, $6);
        `, [user.username, user.name, user.department, user.role, user.password, user.reporting_manager_id])
    return result;
}

// Get User by Manager Id 
const getUserByManagerId = async (id) => {
    const result = await pool.query(`SELECT id, name, username, role FROM employee WHERE reporting_manager_id = $1`, [id])
    return result.rows
}

// Search User
const searchUsersQuery = async (text) => {
    const result = await pool.query(`
        SELECT id, username,name,role
        FROM employee
        WHERE username ILIKE $1
        LIMIT 10
        `, [`%${text}%`])

    return result.rows

}

// Get user by Id
const getUserById = async (id) => {
    const result = await pool.query("SELECT * FROM employee WHERE id = $1 ", [id])
    return result.rows[0]
}


module.exports = {
    getAllUsers,
    getUserByUsername,
    createUser,
    getUserByManagerId,
    searchUsersQuery,
    getUserById
}


