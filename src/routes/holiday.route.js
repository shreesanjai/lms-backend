const express = require("express");
const { verifyToken } = require("../middleware/Authentication");
const { getHolidays } = require("../controller/holiday.controller");

const router = express.Router()

router.get('/', verifyToken, getHolidays)

module.exports = router