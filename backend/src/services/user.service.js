import mongoose from "mongoose";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

const { ObjectId } = mongoose.Types;

// ✅ FOLLOW / UNFOLLOW (OPTIMIZED)
export const toggleFollow = async (userId, targetUserId) => {
  if (!ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid targetUserId");
  }

  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const [me, target] = await Promise.all([
    User.findById(userId).select("following"),
    User.findById(targetUserId).select("followers"),
  ]);

  if (!me || !target) {
    throw new ApiError(404, "User not found");
  }

  const isFollowing = me.following.some(
    (id) => id.toString() === targetUserId.toString()
  );

  if (isFollowing) {
    // ❌ UNFOLLOW
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { following: targetUserId },
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: userId },
      }),
    ]);

    return {
      message: "User unfollowed successfully",
      data: {
        targetUserId,
        isFollowing: false,
      },
    };
  }

  // ✅ FOLLOW
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId },
    }),
    User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId },
    }),
  ]);

  return {
    message: "User followed successfully",
    data: {
      targetUserId,
      isFollowing: true,
    },
  };
};

// ✅ GET PROFILE (CLEAN + SAFE)
export const getProfile = async (requesterId, userIdQuery) => {
  const userId = userIdQuery || requesterId;

  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const profile = await User.findById(userId)
    .select(
      "name username email bio avatarUrl followers following createdAt"
    )
    .lean();

  if (!profile) {
    throw new ApiError(404, "User not found");
  }

  const isFollowing = profile.followers.some(
    (id) => id.toString() === requesterId.toString()
  );

  return {
    id: profile._id,
    name: profile.name,
    username: profile.username,
    email: profile.email,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,

    followersCount: profile.followers.length,
    followingCount: profile.following.length,

    isSelf: requesterId.toString() === profile._id.toString(),
    isFollowing,

    createdAt: profile.createdAt,
  };
};

// 🔍 SEARCH USERS (IMPORTANT FOR FEED)
export const searchUsers = async (query, currentUserId) => {
  if (!query) return [];

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
    _id: { $ne: currentUserId }, // exclude self
  })
    .select("name username avatarUrl followers")
    .limit(10)
    .lean();

  return users.map((user) => ({
    id: user._id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    followersCount: user.followers.length,
    isFollowing: user.followers.some(
      (id) => id.toString() === currentUserId.toString()
    ),
  }));
};