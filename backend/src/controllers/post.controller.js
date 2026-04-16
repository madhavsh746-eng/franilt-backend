import asyncHandler from '../utils/asyncHandler.js';
import * as postService from '../services/post.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user._id, req.body.content, req.file);
  return res.status(201).json(new ApiResponse(201, 'Post created successfully', post));
});

export const getPosts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 50);

  const result = await postService.getFeed(req.user._id, page, limit);

  return res.status(200).json(
    new ApiResponse(200, 'Feed fetched successfully', result.posts, {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    })
  );
});

export const likeUnlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const result = await postService.toggleLike(req.user._id, postId);
  return res.status(200).json(new ApiResponse(200, result.message, result.data));
});

export const commentOnPost = asyncHandler(async (req, res) => {
  const { postId, text } = req.body;
  const comment = await postService.addComment(req.user._id, postId, text);
  return res.status(201).json(new ApiResponse(201, 'Comment added successfully', comment));
});

export const updatePost = asyncHandler(async (req, res) => {
  const updated = await postService.updatePost(req.user._id, req.params.id, req.body, req.file);
  return res.status(200).json(new ApiResponse(200, 'Post updated successfully', updated));
});

export const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, 'Post deleted successfully', result));
});