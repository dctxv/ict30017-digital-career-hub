
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Configuration
const JWT_SECRET = "your_secret_key";

// POSTGRESQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'auth_demo',
  password: 'your_password',
  port: 5432,
});

// This created a table if it doesn't exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  );
`);

// Input validation for security
function validateRegister({ username, email, password }) {
  if (!username || username.length < 3)
    return 'Username must be at least 3 characters';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    return 'Invalid email format';

  if (!password || password.length < 6)
    return 'Password must be at least 6 characters';

  return null;
}

function validateLogin({ email, password }) {
  if (!email || !password)
    return 'Email and password are required';

  return null;
}

// Middleware Authentication
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Role checking 
function roleMiddleware(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Functional register
app.post('/register', async (req, res) => {
  const error = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error });

  const { username, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashed]
    );

    res.json({ message: 'User registered', userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login part
app.post('/login', async (req, res) => {
  const error = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error });

  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'User not found' });

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route
app.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: 'Profile data', user: req.user });
});

// Admin only part (Will be updated)
app.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

app.listen(5000, () => console.log('Server running on port 5000'));


// How to run the code

// 1. Install PostgreSQL and create DB: auth_demo
// 2. npm init -y
// 3. npm install express pg bcryptjs jsonwebtoken cors
// 4. node server.js

