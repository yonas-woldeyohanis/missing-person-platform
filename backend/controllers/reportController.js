const Report = require("../models/reportModel"); // Import our model
const Comment = require("../models/commentModel");
// In reportController.js

// @desc    Get all PUBLIC reports (status: 'approved') with search
// @route   GET /api/reports
// @access  Public
// In reportController.js
const getReports = async (req, res) => {
  try {
    // --- BUILD THE QUERY OBJECT ---
    const query = { status: 'approved' }; // Start with the base requirement

    // 1. Add keyword search if it exists
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { lastSeen: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }
    
    // 2. Add region filter if it exists
    if (req.query.region) {
      query.region = req.query.region;
    }
    // -----------------------------
    
    console.log("Executing search query:", query); // Good for debugging

    const reports = await Report.find(query).populate('user', 'name');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      "user",
      "name"
    );
    if (report) {
      res.status(200).json(report);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const {
      name,
      age,
      lastSeen,
      description,
      photoUrl,
      contactInfo,
      latitude,
      longitude,
      region,
    } = req.body;
    if (!name || !age || !lastSeen) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    const report = await Report.create({
      name,
      age,
      lastSeen,
      description,
      photoUrl,
      contactInfo,
      latitude,
      longitude,
      region,
      user: req.user.id,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc    Get reports for the logged-in user
// @route   GET /api/reports/myreports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).populate(
      "user",
      "name"
    );
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching user reports" });
  }
};

const getAllReportsAdmin = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { lastSeen: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    // No 'status' filter here, so it searches everything
    const reports = await Report.find({ ...keyword }).populate("user", "name");
    res.status(200).json(reports);
  } catch (error) {
    console.error("ADMIN FETCH ERROR:", error);
    res.status(500).json({ message: "Server Error getting all reports" });
  }
};

// @desc    Approve a report
// @route   PUT /api/reports/:id/approve
// @access  Private/Admin
const approveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = "approved";
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- NEWLY ADDED FUNCTIONS ---

// @desc    Reject (or un-approve) a report
// @route   PUT /api/reports/:id/reject
// @access  Private/Admin
const rejectReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = "rejected";
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      await report.deleteOne();
      res.json({ message: "Report removed" });
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    console.error("DELETE REPORT ERROR:", error);
    res.status(500).json({ message: "Server Error during deletion" });
  }
};

// @desc    Mark a report as found
// @route   PUT /api/reports/:id/found
// @access  Private/Admin
const markAsFound = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = "found";
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all 'found' reports
// @route   GET /api/reports/found
// @access  Public
// In reportController.js

const getFoundReports = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { lastSeen: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    // Combine the keyword search with the 'found' status filter
    const query = { ...keyword, status: "found" };
    const reports = await Report.find(query).populate("user", "name");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// In reportController.js

// @desc    Like or Unlike a report
// @route   PUT /api/reports/:id/like
// @access  Private
const likeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // The user's ID comes from our 'protect' middleware
    const userId = req.user.id;

    // Check if the user has already liked this post
    const alreadyLiked = report.likes.includes(userId);

    if (alreadyLiked) {
      // If already liked, remove the user's ID from the array (unlike)
      report.likes = report.likes.filter((id) => id.toString() !== userId);
    } else {
      // If not liked, add the user's ID to the array (like)
      report.likes.push(userId);
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// In reportController.js

// @desc    Get all 'rejected' reports (for admin)
// @route   GET /api/reports/rejected
// @access  Private/Admin
const getRejectedReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: "rejected" });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Revert a report's status back to 'pending'
// @route   PUT /api/reports/:id/revert-to-pending
// @access  Private/Admin
const revertToPending = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = "pending";
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Revert a 'found' report back to 'approved'
// @route   PUT /api/reports/:id/revert-to-approved
// @access  Private/Admin
const revertToApproved = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = "approved";
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// In reportController.js

// @desc    Update a user's own report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if the logged-in user is the author of the post
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
      }
    );

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a user's own report
// @route   DELETE /api/reports/:id (for users)
// @access  Private
const deleteUserReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Authorization check
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await report.deleteOne();
    res.json({ id: req.params.id, message: "Report removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// In reportController.js

// @desc    Create a new comment on a report
// @route   POST /api/reports/:id/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    // Now accepts an optional parentCommentId
    const { text, parentCommentId } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const commentData = {
      report: req.params.id,
      user: req.user.id,
      text: text,
    };

    // If a parentCommentId is provided, add it to our data
    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
    }

    const newComment = await Comment.create(commentData);
    const populatedComment = await Comment.findById(newComment._id).populate(
      "user",
      "name"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all comments for a report
// @route   GET /api/reports/:id/comments
// @access  Public
const getCommentsForReport = async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: "asc" });

    // --- NEW LOGIC TO NEST REPLIES ---
    const commentMap = {};
    const nestedComments = [];

    // First pass: create a map of all comments by their ID
    comments.forEach((comment) => {
      comment._doc.replies = []; // Add a 'replies' array to each comment
      commentMap[comment._id] = comment;
    });

    // Second pass: nest the replies under their parents
    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent._doc.replies.push(comment);
        }
      } else {
        nestedComments.push(comment); // This is a top-level comment
      }
    });
    // ------------------------------------

    res.json(nestedComments); // Send back only the top-level comments with their replies nested inside
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
// @desc    Delete a comment
// @route   DELETE /api/reports/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the author of the comment OR if they are an admin
    if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update (edit) a comment
// @route   PUT /api/reports/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ message: "User not authorized" });

    comment.text = req.body.text || comment.text;
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// In reportController.js

// In reportController.js

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // --- THIS IS THE FIX ---
    // Ensure the 'likes' array exists before we try to use it.
    if (!comment.likes) {
      comment.likes = [];
    }
    // -----------------------

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);

    console.log(`--- Liking Comment ${req.params.id} by User ${userId} ---`);

    if (alreadyLiked) {
      console.log("Action: UNLIKE");
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      console.log("Action: LIKE");
      comment.likes.push(userId);
    }

    const updatedComment = await comment.save();

    console.log("Save successful. New likes array:", updatedComment.likes);

    res.json(updatedComment);
  } catch (error) {
    console.error("LIKE COMMENT ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  getMyReports,
  getAllReportsAdmin,
  approveReport,
  rejectReport,
  deleteReport,
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
};
