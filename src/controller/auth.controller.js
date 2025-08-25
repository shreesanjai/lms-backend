const { getUserByUsername } = require("../model/employeeModel")
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
        })

        return sendSuccess(res, {
            username: user.username,
            token: token,
            message: "Authenticated User"
        })

    } catch (error) {
        return sendError(res, "Internal Server Error", 500, error)
    }
}

module.exports = { login }


