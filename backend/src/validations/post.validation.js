export function validateCreatePost(req, res, next) {
  const { content } = req.body;
  if (!content || !String(content).trim()) {
    return res.status(400).json({ success: false, message: 'content is required' });
  }
  return next();
}

export function validateLikePost(req, res, next) {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ success: false, message: 'postId is required' });
  }
  return next();
}

export function validateCommentPost(req, res, next) {
  const { postId, text } = req.body;
  if (!postId || !text || !String(text).trim()) {
    return res.status(400).json({ success: false, message: 'postId and text are required' });
  }
  return next();
}