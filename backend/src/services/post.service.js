import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = (buffer, folder = 'socialmini/posts') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
});


export const createPost = async (userId, content, file) => {
  let image = { url: '', publicId: '' };

  if (file?.buffer) {
    const uploaded = await uploadToCloudinary(file.buffer);
    image = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  const post = await Post.create({ author: userId, content, image });
  return Post.findById(post._id).populate('author', 'name username avatarUrl');
};

export const updatePost = async (userId, postId, { content }, file) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApiError(400, 'Invalid postId');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.author.toString() !== userId.toString()) throw new ApiError(403, 'Not allowed');

  if (typeof content === 'string') post.content = content.trim();

  if (file?.buffer) {
    // delete old
    if (post.image?.publicId) {
      await cloudinary.uploader.destroy(post.image.publicId).catch(() => {});
    }
    const uploaded = await uploadToCloudinary(file.buffer);
    post.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
  }

  await post.save();
  return Post.findById(post._id)
    .populate('author', 'name username avatarUrl')
    .populate('comments.user', 'name username avatarUrl')
    .lean();
};

export const getFeed = async (userId, page = 1, limit = 10) => {
  const user = await User.findById(userId).select('following');
  if (!user) throw new ApiError(404, 'User not found');

  const authorIds = [userId, ...user.following];
  const query = { author: { $in: authorIds } };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name username avatarUrl')
      .populate('comments.user', 'name username avatarUrl')
      .lean(),
    Post.countDocuments(query),
  ]);

  return { posts, total };
};

export const toggleLike = async (userId, postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, 'Invalid postId');
  }

  const post = await Post.findById(postId).select('_id likes');
  if (!post) throw new ApiError(404, 'Post not found');

  const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

  let updated;
  if (alreadyLiked) {
    updated = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true }).select(
      '_id likes'
    );
    return {
      message: 'Post unliked successfully',
      data: { postId: updated._id, likesCount: updated.likes.length, liked: false },
    };
  }

  updated = await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true }).select(
    '_id likes'
  );

  return {
    message: 'Post liked successfully',
    data: { postId: updated._id, likesCount: updated.likes.length, liked: true },
  };
};

export const addComment = async (userId, postId, text) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, 'Invalid postId');
  }

  const updated = await Post.findByIdAndUpdate(
    postId,
    {
      $push: {
        comments: {
          user: userId,
          text,
        },
      },
    },
    { new: true }
  ).populate('comments.user', 'name username avatarUrl');

  if (!updated) throw new ApiError(404, 'Post not found');

  return updated.comments[updated.comments.length - 1];
};

export const deletePost = async (userId, postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) throw new ApiError(400, 'Invalid postId');

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.author.toString() !== userId.toString()) throw new ApiError(403, 'Not allowed');

  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId).catch(() => {});
  }

  await Post.deleteOne({ _id: postId });
  return { postId, deleted: true };
};
