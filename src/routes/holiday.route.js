const express = require("express");
const { verifyToken } = require("../middleware/Authentication");
const { getHolidays, addHolidaysBulk } = require("../controller/holiday.controller");

const router = express.Router()

router.get('/', verifyToken, getHolidays)
router.post('/', verifyToken, addHolidaysBulk)

module.exports = router