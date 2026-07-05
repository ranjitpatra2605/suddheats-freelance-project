const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const rawUser = await User.findUnique({
            where: { id: decoded.id }
        });
        if (!rawUser) {
            return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
        }
        const { password, ...userWithoutPassword } = rawUser;
        req.user = userWithoutPassword;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};
