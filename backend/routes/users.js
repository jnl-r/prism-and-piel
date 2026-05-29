const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, name, email, created_at FROM User');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user by ID (e.g. USR-001)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, created_at FROM User WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email, and password are required' });

    const user_id = await genId(db, 'User', 'user_id', 'USR');
    await db.query(
      'INSERT INTO User (user_id, name, email, password) VALUES (?, ?, ?, ?)',
      [user_id, name, email, password]
    );
    res.status(201).json({ user_id, name, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [result] = await db.query(
      'UPDATE User SET name = ?, email = ?, password = ? WHERE user_id = ?',
      [name, email, password, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM User WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
