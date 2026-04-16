import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const followUnfollow = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;

  const result = await userService.toggleFollow(
    req.user._id,
    targetUserId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(
    req.user._id,
    req.query.userId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", profile));
});

// 🔍 SEARCH USER
export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  const users = await userService.searchUsers(query, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});