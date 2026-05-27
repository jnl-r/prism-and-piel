const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await db.query(
      'SELECT user_id, name, email FROM User WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password.' });

    res.json(rows[0]); // { user_id, name, email }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required.' });

    const [result] = await db.query(
      'INSERT INTO User (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    res.status(201).json({ user_id: result.insertId, name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'That email is already registered.' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;