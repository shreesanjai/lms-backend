const {
    getUserByUsername,
    createUser,
    getAllUsers,
    getUserByManagerId,
    searchUsersQuery
} = require("../model/employeeModel");

const { sendError, sendSuccess } = require("../utils/responses");


const newUser = async (req, res) => {

    const { username, password, role, reporting_manager_id } = req.body;

    if (!(req.user.role === "HR" || req.user.role === "admin"))
        return sendError(res, "Authorization Error", 401)

    try {
        if (await getUserByUsername(username))
            return sendError(res, "Username Already Exists!", 400)

        await createUser({
            username: username,
            password: password,
            role: role,
            reporting_manager_id: reporting_manager_id
        })

        return sendSuccess(res, {
            message: "User Created",
            username: username,
            role: role
        })

    } catch (error) {
        return sendError(res, "Error occured", 400, error)
    }
}

const allUsers = async (req, res) => {

    try {
        const result = await getAllUsers();

        return sendSuccess(res, { data: result })

    } catch (error) {
        return sendError(res, "Internal Server Error", 500, error)
    }

}

const getAllMyUsers = async (req, res) => {
    try {
        const result = await getUserByManagerId(req.user.id);

        return sendSuccess(res, { data: result })
    } catch (error) {
        return sendError(res, "Internal Server Error", 500, error)
    }
}

const searchUsers = async (req, res) => {

    try {

        const query = req.query.q
        if (!query || query.trim === "")
            return sendError(res, "Query required", 400)

        const result = await searchUsersQuery(query)

        return sendSuccess(res, { suggestions: result })

    } catch (error) {
        return sendError(res, "Internal Server Error", 400, error)
    }
}

module.exports = {
    newUser,
    allUsers,
    getAllMyUsers,
    searchUsers
};