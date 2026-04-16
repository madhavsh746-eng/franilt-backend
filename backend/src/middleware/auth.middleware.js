import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: token missing',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name username email');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found',
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: invalid token',
    });
  }
}

export default auth;