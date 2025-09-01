const { getAllHolidays } = require("../model/HolidayModel")
const { sendSuccess, sendError } = require("../utils/responses")

const getHolidays = async (req, res) => {
    const { startDate, endDate } = req.query
    var start, end;

    if (!startDate || !endDate) {
        const currentYear = (new Date()).getFullYear()
        start = new Date("January 01," + currentYear)
        end = new Date("December 31," + currentYear)
    }
    else {
        start = startDate;
        end = endDate
    }

    try {
        const response = await getAllHolidays({ startDate: start, endDate: end })
        return sendSuccess(res, { data: response })
    } catch (error) {
        return sendError(res, error.message, 500, error)
    }
}

module.exports = { getHolidays }