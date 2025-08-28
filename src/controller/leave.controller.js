const { sendSuccess, sendError } = require("../utils/responses")
const { getPendingLeaveRequestByUserId, createLeaveRequest } = require("../model/LeaveModel")
const { getHolidayOnRange } = require("../model/HolidayModel")

const getMyPendingRequests = async (req, res) => {
    try {
        const id = req.user.id
        const data = await getPendingLeaveRequestByUserId(id)
        return sendSuccess(res, { data: data })

    } catch (error) {
        return sendError(res, "Internal Server Error", 500)
    }
}

const newLeaveRequest = async (req, res) => {

    try {
        const { startDate, endDate, no_of_days, policy_id, notes } = req.body

        const resp = await createLeaveRequest({
            employee_id: req.user.id,
            startDate,
            endDate,
            no_of_days,
            policy_id,
            notes
        })

        return sendSuccess(res, { message: "Leave Request Created", id: resp.id })

    } catch (error) {
        return sendError(res, "Internal Server Error", 500)
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
        return sendError(res, "Internal Server Error", 500);
    }
};

module.exports = { getMyPendingRequests, newLeaveRequest, getWorkingDaysWithinRange }