const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-auth-key-2026-secure',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if running behind HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// Utility functions for JSON store management
function readUsersFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

function writeUsersToFile(users) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing users file:', err);
    throw new Error('Database write failure');
  }
}

// Password Complexity Validation Function
// Rules: minimum 8 characters, at least 1 number
function validatePasswordComplexity(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number.' };
  }
  return { valid: true };
}

// --- API ROUTES ---

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Sanitize and trim inputs
    username = username ? username.trim() : '';
    email = email ? email.trim().toLowerCase() : '';
    password = password || '';

    // 1. Basic Form Validation (no empty submissions)
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Username, Email, Password) are required.',
      });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 2. Password Complexity Validation
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // 3. Duplicate Username/Email Check
    const users = readUsersFromFile();

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose another.',
      });
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email
    );
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please use another or login.',
      });
    }

    // 4. Secure Password Hashing with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      username,
      email,
      passwordHash, // Stored securely hashed, NEVER plain text
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    users.push(newUser);
    writeUsersToFile(users);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
    });
  } catch (err) {
    console.error('Registration server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * Body: { identifier, password }  (identifier can be username or email)
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    let { identifier, password } = req.body;

    identifier = identifier ? identifier.trim().toLowerCase() : '';
    password = password || '';

    // Basic Form Validation (no empty submissions)
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both Username/Email and Password are required.',
      });
    }

    const users = readUsersFromFile();

    // Generic error message for security: DO NOT reveal which field is wrong
    const GENERIC_ERROR = 'Invalid username/email or password.';

    // Find user by username OR email
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: GENERIC_ERROR,
      });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: GENERIC_ERROR,
      });
    }

    // Update last login timestamp
    user.lastLoginAt = new Date().toISOString();
    writeUsersToFile(users);

    // Establish express session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: req.session.user,
    });
  } catch (err) {
    console.error('Login server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns current logged-in user profile or 401 if unauthenticated
 */
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      authenticated: true,
      user: req.session.user,
    });
  }
  return res.status(401).json({
    authenticated: false,
    message: 'Unauthorized. No active session found.',
  });
});

/**
 * POST /api/auth/logout
 * Destroys current session and clears cookie
 */
app.post('/api/auth/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Could not log out. Please try again.',
        });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  } else {
    return res.status(200).json({
      success: true,
      message: 'No session to log out.',
    });
  }
});

// Fallback route: serve index.html for any SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🔐 Authentication Server running on port ${PORT}`);
    console.log(`👉 Access App at http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

module.exports = app;

