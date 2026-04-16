export function validateRegister(req, res, next) {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, username, email, password are required' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  return next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }
  return next();
}