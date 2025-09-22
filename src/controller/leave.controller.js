const { sendSuccess, sendError } = require("../utils/responses")
const {
    getPendingLeaveRequestByUserId,
    createLeaveRequest,
    myUserPendingRequests,
    statusUpdate,
    getAvailability,
    leaveAvailabilityUpdate,
    getLeaveRequestByEmployeeId,
    getSummaryData,
    getMonthlyLeaveStats,
    getWeeklyLeaveStats,
    getLeaveRequestById,
    myPeoplePendingRequests,
    availabilityCheck,
    getContinutityLeaveRequests
} = require("../model/LeaveModel")
const { getHolidayOnRange, getFloaterOnRange } = require("../model/HolidayModel")
const { LEAVE_STATUS } = require('../utils/constants.js')

const getMyPendingRequests = async (req, res) => {
    try {
        const id = req.user.id
        const data = await getPendingLeaveRequestByUserId(id)
        return sendSuccess(res, { data: data })

    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const newLeaveRequest = async (req, res) => {

    try {
        const { startDate, endDate, no_of_days, policy_id, notes } = req.body
        const id = req.user.id;

        const resp = await createLeaveRequest({
            employee_id: id,
            startDate,
            endDate,
            no_of_days,
            policy_id,
            notes
        })

        const currentAvail = (await getAvailability(id, policy_id)).availability

        const updatedAvailability = Number(currentAvail) - Number(no_of_days);

        const response = await leaveAvailabilityUpdate(id, policy_id, updatedAvailability);

        if (resp && response)
            return sendSuccess(res, { message: "Leave Request Created", id: resp.id })


    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const getWorkingDaysWithinRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const holidays = await getHolidayOnRange({ startDate, endDate });

        const formatDate = (d) => d.toLocaleDateString("en-CA");
        const holidayDates = new Set(holidays.map(h => formatDate(new Date(h.date))));

        const start = new Date(startDate);
        const end = new Date(endDate);

        let workingDays = 0;
        let weekends = 0;
        let holidayCount = 0;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const day = d.getDay();
            const dateStr = formatDate(d);

            if (day === 0 || day === 6) {
                weekends++;
                continue;
            }

            if (holidayDates.has(dateStr)) {
                holidayCount++;
                continue;
            }

            workingDays++;
        }

        return sendSuccess(res, {
            data: {
                workingDays,
                weekends,
                holidays: holidayCount,
                totalDays: workingDays + weekends + holidayCount,
            },
        });
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

const isFloaterOnRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate)

        const data = await getFloaterOnRange({
            startDate: start,
            endDate: end
        })

        return sendSuccess(res, { data })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const myUsersPendingRequests = async (req, res) => {
    try {
        const { id, department } = req.user;

        let response = await myUserPendingRequests(id);

        if (department === "HR") {

            const hrResponse = await myPeoplePendingRequests(id);
            response = [...response, ...hrResponse];
        }

        return sendSuccess(res, { data: response });
    } catch (error) {
        return sendError(res, error.message, 500, error);
    }
};

const availableCheck = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { id } = req.user;
        let response = await availabilityCheck(id, startDate, endDate);

        return sendSuccess(res, {
            message: response.length > 0 ? "Leave already applied on selected interval" : null
        })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const approveRequest = async (req, res) => {
    const { id: leave_request_id } = req.query
    try {

        const leaveRequest = await getLeaveRequestById(leave_request_id);
        var resp;

        if (leaveRequest.status === LEAVE_STATUS.PARTIAL_APPROVE && req.user.department === "HR")
            resp = await statusUpdate(leave_request_id, LEAVE_STATUS.APPROVED, "-")
        else
            resp = await statusUpdate(leave_request_id, LEAVE_STATUS.PARTIAL_APPROVE, "-")

        return sendSuccess(res, { data: resp })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const rejectRequest = async (req, res) => {
    const { id } = req.query
    const { data } = req.body;

    try {

        const response = await statusUpdate(id, LEAVE_STATUS.REJECTED, data);

        const employee_id = response.employee_id;
        const policy_id = response.policy_id;

        const responsi = await getAvailability(employee_id, policy_id);
        const getAvail = responsi.availability;

        const resp = await leaveAvailabilityUpdate(employee_id, policy_id, Number(response.no_of_days) + Number(getAvail))

        if (resp && getAvail && response)
            return sendSuccess(res, { data: response })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const cancelRequest = async (req, res) => {
    const { id } = req.query;
    const { data } = req.body || "";

    try {
        const response = await statusUpdate(id, LEAVE_STATUS.CANCELLED, data);

        if (!response) {
            return sendError(res, "Failed to update leave status", 400);
        }

        const employee_id = response.employee_id;
        const policy_id = response.policy_id;

        const responsi = await getAvailability(employee_id, policy_id);

        if (!responsi) {
            return sendError(res, "Availability not found", 404);
        }

        const getAvail = responsi.availability;

        const resp = await leaveAvailabilityUpdate(
            employee_id,
            policy_id,
            Number(response.no_of_days) + Number(getAvail)
        );

        if (!resp) {
            return sendError(res, "Failed to update leave availability", 500);
        }

        return sendSuccess(res, { data: response });
    } catch (error) {
        return sendError(res, error.message, 500);
    }
}

const getMyleaveRequestHistory = async (req, res) => {
    try {
        const { id } = req.user
        const year = req.query.year || new Date().getFullYear()

        const response = await getLeaveRequestByEmployeeId(id, year);


        return sendSuccess(res, { data: response })

    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const leaveSummary = async (req, res) => {
    try {
        const { id } = req.user
        const year = req.query.year || new Date().getFullYear()

        const response = await getSummaryData(id, year);
        const monthlyStats = await getMonthlyLeaveStats(id, year);
        const weeklyStats = await getWeeklyLeaveStats(id, year);

        if (response)
            return sendSuccess(res, {
                summary: response,
                monthStat: monthlyStats,
                weekstat: weeklyStats
            })

    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

const continuityCheck = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = new Date(endDate);
        start.setDate(start.getDate() + 1);

        const end = new Date(startDate);
        end.setDate(end.getDate() - 1);

        const response = await getContinutityLeaveRequests(start.toLocaleDateString("en-CA"), end.toLocaleDateString("en-CA"));

        return sendSuccess(res, { data: response })
    } catch (error) {
        return sendError(res, error.message, 500)
    }
}

module.exports = {
    getMyPendingRequests,
    newLeaveRequest,
    getWorkingDaysWithinRange,
    isFloaterOnRange,
    myUsersPendingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    getMyleaveRequestHistory,
    leaveSummary,
    availableCheck,
    continuityCheck
}