const express = require("express");
const { verifyToken } = require("../middleware/Authentication");
const { getPolicyNames } = require("../controller/policy.controller");

const router = express.Router()

router.get('/', verifyToken, getPolicyNames)

module.exports = router