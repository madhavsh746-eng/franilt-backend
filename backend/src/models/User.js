import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_.]+$/,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

  next();
});


userSchema.methods.comparePassword = function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;