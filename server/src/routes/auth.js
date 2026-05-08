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

export default router;