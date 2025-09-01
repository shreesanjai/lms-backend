const { getUserByUsername, getUserById } = require("../model/employeeModel")
const { generateToken } = require("../utils/generateToken")
const { sendError, sendSuccess } = require("../utils/responses")



const login = async (req, res) => {
    const { username, password } = req.body

    try {

        const user = await getUserByUsername(username)

        if (!user)
            return sendError(res, "User not found", 404)

        if (password !== user.password)
            return sendError(res, "Invalid Password", 401)

        var token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            department: user.department
        })

        return sendSuccess(res, {
            token, user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                department: user.department
            }
        })

    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const getProfile = async (req, res) => {
    const id = req.user.id;

    try {
        const user = await getUserById(id);

        if (!user)
            return sendError(res, "User not found", 400)

        return sendSuccess(res, { user })

    } catch (error) {
        return sendError(res, error.message, 500)
    }


}

module.exports = { login, getProfile }


