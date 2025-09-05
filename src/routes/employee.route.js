const express = require("express");
const {
    newUser,
    allUsers,
    getAllMyUsers,
    searchUsers,
    modifyUser,
    myTeamLeave
} = require("../controller/employee.controller");

const { verifyToken } = require("../middleware/Authentication");

const router = express.Router();

router.post('/', verifyToken, newUser)
router.get('/', verifyToken, allUsers)
router.put('/', verifyToken, modifyUser)

router.get('/myusers', verifyToken, getAllMyUsers)
router.get('/search', verifyToken, searchUsers)
router.get('/team-summary', verifyToken, myTeamLeave)

module.exports = router