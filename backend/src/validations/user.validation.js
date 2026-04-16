import mongoose from "mongoose";

export function validateFollowToggle(req, res, next) {
  const { targetUserId } = req.body;

  // ❌ Missing ID
  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: "targetUserId is required",
    });
  }

  // ❌ Invalid ObjectId
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid targetUserId",
    });
  }

  // ❌ Self follow
  if (req.user && req.user._id.toString() === targetUserId.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot follow yourself",
    });
  }

  next();
}

export function validateSearchQuery(req, res, next) {
  const { query } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
  }

  next();
}