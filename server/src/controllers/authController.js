const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'promptvault_secret',
    { expiresIn: '7d' }
  );
};

// POST /auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture: avatar } = payload;

    // Upsert user in DB
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, name, email, avatar });
    } else {
      // Update avatar/name in case they changed
      user.name = name;
      user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
      customCategories: req.user.customCategories,
      hiddenCategories: req.user.hiddenCategories,
    },
  });
};

// POST /auth/categories
const addCustomCategory = async (req, res) => {
  try {
    const { label, color } = req.body;
    if (!label || !color) {
      return res.status(400).json({ error: 'Label and color are required' });
    }
    
    // Create a value/slug from the label
    const value = label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if category already exists
    const exists = req.user.customCategories.find(c => c.value === value);
    if (exists) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    const newCategory = { label, value, color };
    
    const user = await User.findById(req.user._id);
    user.customCategories.push(newCategory);
    await user.save();
    
    res.status(201).json({ category: newCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /auth/categories/:value
const removeCategory = async (req, res) => {
  try {
    const { value } = req.params;
    const user = await User.findById(req.user._id);

    // Check if it exists in customCategories
    const customIndex = user.customCategories.findIndex(c => c.value === value);
    
    if (customIndex !== -1) {
      // It's a custom category, remove it
      user.customCategories.splice(customIndex, 1);
    } else {
      // It's a default category, add to hidden list if not already there
      if (!user.hiddenCategories.includes(value)) {
        user.hiddenCategories.push(value);
      }
    }

    await user.save();
    res.json({ message: 'Category removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { googleAuth, getMe, addCustomCategory, removeCategory };
