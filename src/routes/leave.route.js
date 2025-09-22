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
    cancelRequest,
    getMyleaveRequestHistory,
    leaveSummary,
    availableCheck,
    continuityCheck,
} = require("../controller/leave.controller");


const router = express.Router();

router.post('/', verifyToken, newLeaveRequest)
router.get('/', verifyToken, getMyleaveRequestHistory)
router.get('/summary', verifyToken, leaveSummary)

router.get('/my_pending_requests', verifyToken, getMyPendingRequests)
router.get('/workingdays', verifyToken, getWorkingDaysWithinRange)
router.get('/isFloater', verifyToken, isFloaterOnRange)
router.get('/peer_approval', verifyToken, myUsersPendingRequests)
router.get('/available',verifyToken,availableCheck)
router.get('/continuity',verifyToken,continuityCheck)

router.put('/approve', verifyToken, approveRequest)
router.put('/reject', verifyToken, rejectRequest)
router.put('/cancel', verifyToken, cancelRequest)

module.exports = router