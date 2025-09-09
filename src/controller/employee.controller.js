const {
    getUserByUsername,
    createUser,
    getAllUsers,
    getUserByManagerId,
    searchUsersQuery,
    getUserById,
    updateUser,
    getMyTeamHR,
} = require("../model/employeeModel");
const { getTeamLeaves, getPeopleLeaves } = require("../model/LeaveModel");

const { sendError, sendSuccess } = require("../utils/responses");


const newUser = async (req, res) => {

    const { username, password, role, reporting_manager_id, name, department, hr_id } = req.body;

    if (!(req.user.role === "HR" || req.user.role === "Admin"))
        return sendError(res, "Authorization Error", 401)

    try {
        if (await getUserByUsername(username))
            return sendError(res, "Username Already Exists!", 400)

        await createUser({
            username: username,
            name: name,
            department: department,
            password: password,
            role: role,
            reporting_manager_id: reporting_manager_id,
            hr_id: hr_id
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

    const { id } = req.query;

    try {
        if (!id) {
            const result = await getAllUsers();
            return sendSuccess(res, { data: result })
        } else {
            const resp = await getUserById(id);
            if (resp)
                return sendSuccess(res, resp)
        }

    } catch (error) {
        return sendError(res, error.message, 500)
    }

}

const getAllMyUsers = async (req, res) => {
    try {
        const { id, department } = req.user;


        let hrResp = [];

        if (department === "HR") {
            hrResp = await getMyTeamHR(id);
        }


        const result = await getUserByManagerId(id);

        return sendSuccess(res, { data: result, ...{ hrData: hrResp } })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const searchUsers = async (req, res) => {

    try {

        const query = req.query.q
        if (!query || query.trim === "")
            return sendError(res, "Query required", 400)

        const result = await searchUsersQuery(query)

        const resp = result.filter(item => (item.department !== "ADMIN" && item.department !== "INTERN"))

        return sendSuccess(res, { suggestions: resp })

    } catch (error) {
        return sendError(res, error.message, 400)
    }
}

const modifyUser = async (req, res) => {

    const { id, username, password, role, reporting_manager_id, name, department, hr_id } = req.body;


    if (req.user.role !== "Admin")
        return sendError(res, "Authorization Error", 401)

    try {

        await updateUser({
            id: id,
            username: username,
            name: name,
            department: department,
            password: password,
            role: role,
            reporting_manager_id: reporting_manager_id,
            hr_id: hr_id
        })

        return sendSuccess(res, {
            message: "User Updated",
            username: username,
            role: role
        })

    } catch (error) {
        return sendError(res, "Error occured", 400, error)
    }
}

const myTeamLeave = async (req, res) => {
    try {
        const { id, department } = req.user;
        const year = req.query.year || new Date().getFullYear();

        let response = await getTeamLeaves(id, year);

        if (department === "HR") {
            const hrResponse = await getPeopleLeaves(id, year);
            response = [...response.map(item => ({ ...item, team: true })), ...hrResponse.map(item => ({ ...item, team: false }))];
        }

        return sendSuccess(res, { data: response });
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

const getTeamLeaveCalendar = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const { id } = req.user;

        // Validate date parameters
        if (!fromDate || !toDate) {
            return sendError(res, "fromDate and toDate are required", 400);
        }


        const leaveRequests = (await getTeamLeaves(id, new Date(fromDate).getFullYear(), new Date(toDate).getMonth() + 1)).reduce((acc, current) => {
            const emp = current.employee_name
            if (!acc[emp])
                acc[emp] = []
            acc[emp].push(current);
            return acc;
        }, {})

        return sendSuccess(res, {
            data: leaveRequests
        })

    } catch (error) {

        return sendError(res, error.message, 500);
    }
};


module.exports = {
    newUser,
    allUsers,
    getAllMyUsers,
    searchUsers,
    modifyUser,
    myTeamLeave,
    getTeamLeaveCalendar
};