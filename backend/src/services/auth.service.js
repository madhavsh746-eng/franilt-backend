import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { generateToken } from '../utils/jwt.js';

export const register = async ({ name, username, email, password }) => {
  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existing) {
    throw new ApiError(409, 'Email or username already exists');
  }

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  const token = generateToken({ userId: user._id, username: user.username });

  return {
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({ userId: user._id, username: user.username });

  return {
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
    token,
  };
};