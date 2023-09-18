const express = require('express');
const {register,login, forgotPassword, logout, resetPassword, userDetail} = require('../controllers/user.js')
const {authenticationMid} = require("../middleware/auth");
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.post('/reset/:token', resetPassword);
router.get('/profile', authenticationMid, userDetail);


module.exports = router