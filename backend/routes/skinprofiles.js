const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all skin profiles
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SkinProfile');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all profiles for a specific user
router.get('/user/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM SkinProfile WHERE user_id = ?',
      [req.params.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single profile
router.get('/:user_id/:profile_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM SkinProfile WHERE user_id = ? AND profile_id = ?',
      [req.params.user_id, req.params.profile_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Skin profile not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create skin profile
router.post('/', async (req, res) => {
  try {
    const { user_id, profile_id, profile_label, skintone, undertone, skintype, primary_concern, preferred_finish } = req.body;
    if (!user_id || !profile_id || !profile_label || !skintone || !undertone || !skintype)
      return res.status(400).json({ error: 'user_id, profile_id, profile_label, skintone, undertone, and skintype are required' });

    await db.query(
      `INSERT INTO SkinProfile
         (profile_id, user_id, profile_label, skintone, undertone, skintype, primary_concern, preferred_finish)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [profile_id, user_id, profile_label, skintone, undertone, skintype, primary_concern || null, preferred_finish || null]
    );
    res.status(201).json({ message: 'Skin profile created successfully', user_id, profile_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Skin profile with that profile_id already exists for this user' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update skin profile
router.put('/:user_id/:profile_id', async (req, res) => {
  try {
    const { profile_label, skintone, undertone, skintype, primary_concern, preferred_finish } = req.body;
    const [result] = await db.query(
      `UPDATE SkinProfile
       SET profile_label = ?, skintone = ?, undertone = ?, skintype = ?, primary_concern = ?, preferred_finish = ?
       WHERE user_id = ? AND profile_id = ?`,
      [profile_label, skintone, undertone, skintype, primary_concern || null, preferred_finish || null,
       req.params.user_id, req.params.profile_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Skin profile not found' });
    res.json({ message: 'Skin profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE skin profile
router.delete('/:user_id/:profile_id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM SkinProfile WHERE user_id = ? AND profile_id = ?',
      [req.params.user_id, req.params.profile_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Skin profile not found' });
    res.json({ message: 'Skin profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
