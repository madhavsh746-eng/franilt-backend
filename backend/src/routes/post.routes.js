import express from 'express';
import auth from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  createPost,
  getPosts,
  likeUnlikePost,
  commentOnPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller.js';
import { validateCreatePost, validateLikePost, validateCommentPost } from '../validations/post.validation.js';

const router = express.Router();

// create with optional image: field name "image"
router.post('/', auth, upload.single('image'), validateCreatePost, createPost);

router.get('/', auth, getPosts);

router.put('/like', auth, validateLikePost, likeUnlikePost);
router.post('/comment', auth, validateCommentPost, commentOnPost);

// edit/delete
router.put('/:id', auth, upload.single('image'), updatePost);
router.delete('/:id', auth, deletePost);

export default router;