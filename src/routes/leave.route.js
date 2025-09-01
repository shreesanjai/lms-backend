const express = require("express");
const { verifyToken } = require("../middleware/Authentication");
const {
    getMyPendingRequests,
    newLeaveRequest,
    getWorkingDaysWithinRange,
    isFloaterOnRange,
    myUsersPendingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest
} = require("../controller/leave.controller");


const router = express.Router();

router.post('/', verifyToken, newLeaveRequest)
router.get('/my_pending_requests', verifyToken, getMyPendingRequests)
router.get('/workingdays', verifyToken, getWorkingDaysWithinRange)
router.get('/isFloater', verifyToken, isFloaterOnRange)
router.get('/peer_approval', verifyToken, myUsersPendingRequests)
router.get('/approve', verifyToken, approveRequest)
router.get('/reject', verifyToken, rejectRequest)
router.get('/cancel', verifyToken, cancelRequest)

module.exports = router