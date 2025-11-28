const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyOtp);
router.put("/profile", protect, updateUserProfile);
router.get('/:id/profile', getUserProfile);

module.exports = router;