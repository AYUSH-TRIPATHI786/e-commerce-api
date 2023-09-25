const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

const { authenticateUser } = require('../middleware/authentication');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(authenticateUser, logout);

module.exports = router;
