const { getAllHolidays, insertHoliday, updateHoliday, deleteHoliday } = require("../model/HolidayModel")
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

const addHolidaysBulk = async (req, res) => {
    const { validHoliday, deletedHoliday, updatedHoliday } = req.body;

    let inserted = 0;
    let failed = 0;
    let updated = 0;
    let deleted = 0;

    try {
        if (validHoliday.length > 0) {
            const insertResults = await Promise.all(
                validHoliday.map(async (h) => {
                    try {
                        const result = await insertHoliday([h.date, h.description, h.is_floater]);
                        if (result === "success") {
                            inserted++;
                        } else {
                            failed++;
                        }
                    } catch (err) {
                        failed++;
                    }
                })
            );
        }

        if (updatedHoliday.length > 0) {
            const updatedResult = await Promise.all(
                updatedHoliday.map(async (h) => {
                    try {
                        const result = await updateHoliday(h);
                        if (result === "success") {
                            updated++;
                        } else {
                            failed++;
                        }
                    } catch (err) {
                        failed++;
                    }
                })
            );
        }

        if (deletedHoliday.length > 0) {
            const deletedResult = await Promise.all(
                deletedHoliday.map(async (h) => {
                    try {
                        const result = await deleteHoliday(h);
                        if (result === "success") {
                            deleted++;
                        } else {
                            failed++;
                        }
                    } catch (err) {
                        failed++;
                    }
                })
            );

        }

        return sendSuccess(res, { inserted, updated, deleted, failed });
    } catch (error) {
        return sendError(res, error.message, 500, error);
    }
};



module.exports = { getHolidays, addHolidaysBulk }