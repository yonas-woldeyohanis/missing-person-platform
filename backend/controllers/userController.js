const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const sendEmail = require("../config/email");
const crypto = require("crypto");

const registrationStore = {};

// --- Helper function to generate a JWT ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user (sends OTP)
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Please add all fields" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ message: "User with this email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = crypto.randomBytes(3).toString("hex").toUpperCase();

    registrationStore[email] = {
      name,
      email,
      password: hashedPassword,
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    await sendEmail({
      email: email,
      subject: "Your Verification Code",
      message: `Welcome! Your verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
      email: email,
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res
      .status(500)
      .json({
        message: "Could not send verification email. Please check server logs.",
      });
  }
};

// In userController.js
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`--- OTP Verification Attempt ---`);
    console.log(`Received Email: ${email}`);
    console.log(`Received OTP: ${otp}`);

    const tempData = registrationStore[email];
    console.log(`Found stored data:`, tempData); // Let's see what we find

    if (!tempData) {
      console.log("Error: No temporary data found for this email.");
      return res
        .status(400)
        .json({ message: "No registration pending. Please sign up again." });
    }

    if (Date.now() > tempData.expires) {
      console.log("Error: OTP has expired.");
      delete registrationStore[email];
      return res
        .status(400)
        .json({ message: "OTP has expired. Please sign up again." });
    }

    if (otp.toUpperCase() === tempData.otp) {
      console.log("Success: OTP matches. Creating user...");
      const user = await User.create({
        name: tempData.name,
        email: tempData.email,
        password: tempData.password,
      });

      console.log("User created successfully:", user._id);
      delete registrationStore[email];

      return res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.log("Error: Invalid OTP provided.");
      return res.status(400).json({ message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("VERIFICATION ERROR:", error);
    return res
      .status(500)
      .json({ message: "Server error during verification." });
  }
};
// @desc    Authenticate (log in) a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
}; // In userController.js
const Report = require("../models/reportModel"); // We need the Report model here

// @desc    Get a user's public profile (name and approved posts)
// @route   GET /api/users/:id/profile
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    // Step 1: Find the user by their ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Find all reports created by this user that are 'approved'
    const reports = await Report.find({
      user: req.params.id,
      status: "approved",
    });

    // Step 3: Send back the public profile data
    res.json({
      _id: user._id,
      name: user.name,
      reports: reports, // The list of their approved reports
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getUserProfile,
};
