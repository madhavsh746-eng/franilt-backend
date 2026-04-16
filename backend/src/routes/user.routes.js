import express from "express";
import auth from "../middleware/auth.middleware.js";

import {
  followUnfollow,
  getProfile,
  searchUsers,
} from "../controllers/user.controller.js";

import {
  validateFollowToggle,
  validateSearchQuery,
} from "../validations/user.validation.js";

const router = express.Router();

// 🔍 SEARCH USERS
router.get("/search", auth, validateSearchQuery, searchUsers);

// 👤 GET PROFILE
router.get("/profile", auth, getProfile);

// ➕ FOLLOW / UNFOLLOW
router.post("/follow", auth, validateFollowToggle, followUnfollow);

export default router;