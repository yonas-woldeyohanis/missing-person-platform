const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyOtp, getUserProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyOtp);
router.get('/:id/profile', getUserProfile);

module.exports = router;