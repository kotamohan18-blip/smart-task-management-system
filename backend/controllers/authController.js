const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please include all fields');
    }

    // Find if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      lastLoginDate: new Date(),
      streak: 1,
      bestStreak: 1
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          preferences: user.preferences,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please include email and password');
    }

    // Check for user email, select password to check
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Logic for streak update on login
      const now = new Date();
      if (user.lastLoginDate) {
        const lastLogin = new Date(user.lastLoginDate);
        const diffTime = Math.abs(now - lastLogin);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streak += 1;
          if (user.streak > user.bestStreak) user.bestStreak = user.streak;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastLoginDate = now;
      await user.save();

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          preferences: user.preferences,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token (handled by client deleting token)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {},
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
