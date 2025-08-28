const express = require('express');
const { login, getProfile } = require('../controller/auth.controller');
const { verifyToken } = require('../middleware/Authentication');

const router = express.Router();

router.post('/login', login)
router.get('/profile', verifyToken, getProfile)

module.exports = router