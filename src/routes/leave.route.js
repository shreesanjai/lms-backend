const express = require("express");
const { verifyToken } = require("../middleware/Authentication");
const { getMyPendingRequests, newLeaveRequest, getWorkingDaysWithinRange } = require("../controller/leave.controller");


const router = express.Router();

router.post('/', verifyToken, newLeaveRequest)
router.get('/my_pending_requests', verifyToken, getMyPendingRequests)
router.get('/workingdays', verifyToken, getWorkingDaysWithinRange)

module.exports = router