const express = require("express");
const {
    newUser,
    allUsers,
    getAllMyUsers,
    searchUsers
} = require("../controller/employee.controller");

const { verifyToken } = require("../middleware/Authentication");

const router = express.Router();

router.post('/', verifyToken, newUser)
router.get('/', verifyToken, allUsers)
router.get('/myusers', verifyToken, getAllMyUsers)
router.get('/search', verifyToken, searchUsers)

module.exports = router