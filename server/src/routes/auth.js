import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role = 'student' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, full_name, email, role, preferred_language, created_at`,
      [full_name, email, password, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT user_id, full_name, email, password_hash, role, preferred_language, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Temporary demo check. Later replace with bcrypt password hashing.
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

export default router;