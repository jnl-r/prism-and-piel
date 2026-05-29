const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

// GET all reviews
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Review');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET reviews by user
router.get('/user/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Review WHERE user_id = ?',
      [req.params.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET reviews for a variant
router.get('/variant/:variant_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Review WHERE variant_id = ?',
      [req.params.variant_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single review by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Review WHERE review_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create review
router.post('/', async (req, res) => {
  try {
    const { user_id, variant_id, rating, comment, skin_profile_match } = req.body;
    if (!user_id || !variant_id || !rating)
      return res.status(400).json({ error: 'user_id, variant_id, and rating are required' });
    if (rating < 1.0 || rating > 5.0)
      return res.status(400).json({ error: 'rating must be between 1.0 and 5.0' });

    const review_id = await genId(db, 'Review', 'review_id', 'REV');
    await db.query(
      `INSERT INTO Review (review_id, user_id, variant_id, rating, comment, skin_profile_match)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [review_id, user_id, variant_id, rating, comment || null, skin_profile_match ?? null]
    );
    res.status(201).json({ review_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update review
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment, skin_profile_match } = req.body;
    if (rating !== undefined && (rating < 1.0 || rating > 5.0))
      return res.status(400).json({ error: 'rating must be between 1.0 and 5.0' });

    const [result] = await db.query(
      'UPDATE Review SET rating = ?, comment = ?, skin_profile_match = ? WHERE review_id = ?',
      [rating, comment || null, skin_profile_match ?? null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Review WHERE review_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
