
// models/EmployeeModel.js
const { pool } = require("../config/db.js");

// Get all users
const getAllUsers = async () => {
    const result = await pool.query("SELECT id,username,name,role,reporting_manager_id FROM employee");
    return result.rows;
};

// Get user by ID
const getUserByUsername = async (id) => {

    const result = await pool.query("SELECT id,username,name,role,password,department FROM employee WHERE username = $1", [id]);
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
        SELECT 
            id, 
            username,
            name,
            role,
            department,
            reporting_manager_id
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

const updateUser = async (user) => {
    const fields = [
        "name = $1",
        "username = $2",
        "role = $3",
        "department = $4",
        "reporting_manager_id = $5"
    ];

    const values = [
        user.name,
        user.username,
        user.role,
        user.department,
        user.reporting_manager_id
    ];

    let paramIndex = values.length + 1;

    if (user.password && user.password.trim() !== "") {
        fields.push(`password = $${paramIndex}`);
        values.push(user.password);
        paramIndex++;
    }

    values.push(user.id);

    const query = `
    UPDATE employee 
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

    const result = await pool.query(query, values);
    return result.rows;
};


module.exports = {
    getAllUsers,
    getUserByUsername,
    createUser,
    getUserByManagerId,
    searchUsersQuery,
    getUserById,
    updateUser
}


