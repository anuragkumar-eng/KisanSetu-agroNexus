const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const https = require('https');

// Helper to fetch phone.email JSON
const fetchPhoneEmailData = (url) => {
  return new Promise((resolve, reject) => {
    console.log('[fetchPhoneEmailData] Fetching URL:', url);
    if (!url || !url.startsWith('https://')) {
      return reject(new Error('Invalid phone.email URL format: ' + url));
    }
    if (!url.includes('phone.email')) {
      return reject(new Error('URL does not belong to phone.email: ' + url));
    }
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse phone.email response'));
        }
      });
    }).on('error', (e) => reject(new Error('Failed to fetch phone.email data')));
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, role, name, nameHi, phone, user_json_url, location, state, district } = req.body;

    // Validate required fields
    if (!email || !password || !role || !name) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let verifiedPhone = phone;

    // If using Phone.email verification flow
    if (user_json_url) {
      try {
        const phoneData = await fetchPhoneEmailData(user_json_url);
        if (phoneData && phoneData.user_phone_number) {
          verifiedPhone = `${phoneData.user_country_code || '+91'} ${phoneData.user_phone_number}`;
        } else {
          return res.status(400).json({ success: false, message: 'Phone verification failed' });
        }
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid phone verification URL' });
      }
    }

    if (!verifiedPhone) {
      return res.status(400).json({ success: false, message: 'Verified phone number is required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      nameHi,
      phone: verifiedPhone,
      location,
      state,
      district
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id, user.role);
      
      res.status(201).json({
        success: true,
        data: {
          user, // password is automatically omitted by toJSON transformation
          token
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare submitted password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already set by auth middleware
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie if applicable
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  try {
    // Since JWT is stateless and stored in localStorage by frontend,
    // the server just needs to return a success message.
    // The frontend handles deleting the token.
    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user using Phone.email JSON URL
// @route   POST /api/auth/phone-login
// @access  Public
const phoneLogin = async (req, res) => {
  try {
    const { user_json_url } = req.body;
    console.log('[phoneLogin] Received user_json_url:', user_json_url);
    if (!user_json_url) {
      return res.status(400).json({ success: false, message: 'Please provide user_json_url' });
    }

    let verifiedPhone;
    try {
      const phoneData = await fetchPhoneEmailData(user_json_url);
      console.log('[phoneLogin] Fetched phoneData:', phoneData);
      if (phoneData && phoneData.user_phone_number) {
        verifiedPhone = String(phoneData.user_phone_number).replace(/\D/g, ''); // Extract just digits
      } else {
        return res.status(400).json({ success: false, message: 'Phone verification failed' });
      }
    } catch (err) {
      console.error('[phoneLogin] fetchPhoneEmailData error:', err);
      return res.status(400).json({ success: false, message: 'Invalid phone verification URL: ' + err.message });
    }

    // Match last 10 digits allowing optional spaces/dashes (e.g. +91 98765 43210)
    const digits = verifiedPhone.slice(-10).split('');
    const regexStr = digits.join('\\s*\\-?\\s*') + '$';
    const phoneRegex = new RegExp(regexStr);

    // Find user by phone
    const user = await User.findOne({ phone: phoneRegex });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  phoneLogin,
  getMe,
  logoutUser
};
