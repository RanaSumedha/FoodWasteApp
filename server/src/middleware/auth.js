const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ error: 'UNAUTHORIZED' });
    if (!user.isActive) return res.status(403).json({ error: 'ACCOUNT_DEACTIVATED' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
};
