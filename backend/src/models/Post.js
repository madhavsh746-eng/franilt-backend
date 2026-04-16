import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true, _id: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },

    // NEW
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // cloudinary public_id
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;