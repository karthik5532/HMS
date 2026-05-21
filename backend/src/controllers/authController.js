const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  console.log('--- Registration Start ---');
  console.log('Payload:', req.body);
  const { name, username, email, password, role } = req.body;

  try {
    console.log('Checking if user exists...');
    const userExists = await User.findOne({ username });
    console.log('User exists check complete:', !!userExists);

    if (userExists) {
      console.log('Registration Failed: Username taken');
      return res.status(400).json({ message: 'Username already taken' });
    }

    const userData = {
      name,
      username,
      password,
      role: role || 'Patient'
    };

    if (email && email.trim() !== '') {
      userData.email = email;
    }

    console.log('Creating user in DB...');
    const user = await User.create(userData);
    console.log('User created successfully:', user._id);

    if (user) {
      const token = generateToken(user._id);
      console.log('Token generated');
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: token,
      });
      console.log('--- Registration Response Sent ---');
    } else {
      console.log('Registration Failed: Invalid data');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('CRITICAL Registration Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
