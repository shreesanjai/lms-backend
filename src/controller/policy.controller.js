const { getAllPolicybyUserId } = require("../model/PolicyModel");
const { sendSuccess, sendError } = require("../utils/responses");


const getPolicyNames = async (req, res) => {
    try {
        const id = req.user.id
        const response = await getAllPolicybyUserId(id);
        return sendSuccess(res, { data: response })
    } catch (error) {
        return sendError(res, "Internal Server Error", 500)
    }
}

module.exports = { getPolicyNames }