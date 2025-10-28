const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// In authMiddleware.js

const protect = async (req, res, next) => {
  console.log('BACKEND: A request has hit the "protect" middleware.');
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Let's see what user we find
      const user = await User.findById(decoded.id).select('-password');
      console.log('--- USER FOUND IN PROTECT MIDDLEWARE ---', user); // <-- DEBUG LOG
      
      if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = user;
      next();

    } catch (error) {
      console.error('TOKEN VERIFICATION FAILED:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
const admin = (req, res, next) => {
  // We assume the 'protect' middleware has already run
  if (req.user && req.user.isAdmin) {
    next(); // User is an admin, proceed
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };