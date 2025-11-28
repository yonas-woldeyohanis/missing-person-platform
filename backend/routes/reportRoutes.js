const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Import all necessary controller functions
const {
  shareReport,
  getReports,
  getReportById,
  createReport,
  getMyReports,
  approveReport,
  rejectReport,
  deleteReport,
  getAllReportsAdmin,
  markAsFound,
  getFoundReports,
  likeReport,
  getRejectedReports,
  revertToPending,
  revertToApproved,
  updateReport,
  deleteUserReport,
  getCommentsForReport,
  createComment,
  deleteComment,
  updateComment,
  likeComment,
  incrementView,
} = require("../controllers/reportController");

// --- PUBLIC ROUTES (No login required) ---
router.route("/").get(getReports);
router.route("/found").get(getFoundReports);

// --- PROTECTED USER ROUTES (Must be logged in) ---
router.route("/").post(protect, createReport);
router.route("/myreports").get(protect, getMyReports);

// --- PROTECTED ADMIN ROUTES (Must be logged in as an admin) ---
router.route("/all").get(protect, admin, getAllReportsAdmin);
// Admin-only route to get all rejected reports
router.get('/rejected', protect, admin, getRejectedReports);

// This groups all routes that operate on a specific report ID
router.route('/:id')
  .get(getReportById) // Public can view a single report
  .put(protect, updateReport) // Logged-in user can update their own post
  .delete(protect, deleteUserReport); // Logged-in user can delete their own post
  // This handles both GET and POST for comments on a specific report
    router.route('/:id/comments')
      .get(getCommentsForReport)
      .post(protect, createComment);
       // Route for deleting a specific comment by its ID
    router.route('/comments/:id').delete(protect, deleteComment);
    router.route('/comments/:id').put(protect, updateComment);
    router.route('/comments/:id/like').put(protect, likeComment);

// We will keep the separate admin delete for clarity, or we can merge logic later.
// For now, let's create a specific admin delete route to avoid conflicts.
router.route('/admin/:id').delete(protect, admin, deleteReport);
router.route("/:id/approve").put(protect, admin, approveReport);
router.route("/:id/reject").put(protect, admin, rejectReport);
router.route("/:id/found").put(protect, admin, markAsFound);

router.route("/:id/like").put(protect, likeReport);
router.put("/:id/share", protect, shareReport);
router.put("/:id/view", protect, incrementView);


// Admin-only routes for "undo" actions
router.put('/:id/revert-to-pending', protect, admin, revertToPending);
router.put('/:id/revert-to-approved', protect, admin, revertToApproved);

// --- IMAGE UPLOAD ROUTE ---
// DEBUG: Middleware to log request details before Multer touches it
router.post("/upload", (req, res, next) => {
  console.log("------------------------------------------------");
  console.log("📥 [BACKEND] /upload request received");
  console.log("HEADERS:", req.headers['content-type']);
  next();
}, upload.single("image"), async (req, res) => {
  console.log("✅ [BACKEND] Multer processed request.");
  
  // 1. Check if file exists
  if (!req.file) {
    console.error("❌ [BACKEND] No file found in req.file");
    console.log("req.body:", req.body); // See if it came as text instead
    return res.status(400).json({ success: false, message: "No file uploaded. check field name 'image'" });
  }

  console.log("📂 [BACKEND] File details:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    path: req.file.path,
    size: req.file.size
  });

  try {
    console.log("☁️ [BACKEND] Attempting Cloudinary upload...");
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "missing_persons_platform",
      resource_type: "image",
    });
    
    console.log("🎉 [BACKEND] Cloudinary Success:", result.secure_url);
    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  } catch (error) {
    console.error("🔥 [BACKEND] Cloudinary/Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error during upload",
      error: error.message
    });
  }
});

module.exports = router;
