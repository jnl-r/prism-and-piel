const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all affiliate links
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM AffiliateLink');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET affiliate links for a specific variant
router.get('/variant/:variant_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM AffiliateLink WHERE variant_id = ?',
      [req.params.variant_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single affiliate link by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM AffiliateLink WHERE link_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Affiliate link not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create affiliate link
router.post('/', async (req, res) => {
  try {
    const { variant_id, affiliate_url } = req.body;
    if (!variant_id || !affiliate_url)
      return res.status(400).json({ error: 'variant_id and affiliate_url are required' });

    const [result] = await db.query(
      'INSERT INTO AffiliateLink (variant_id, affiliate_url, click_count) VALUES (?, ?, 0)',
      [variant_id, affiliate_url]
    );
    res.status(201).json({ link_id: result.insertId, variant_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update affiliate URL
router.put('/:id', async (req, res) => {
  try {
    const { affiliate_url } = req.body;
    const [result] = await db.query(
      'UPDATE AffiliateLink SET affiliate_url = ? WHERE link_id = ?',
      [affiliate_url, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Affiliate link not found' });
    res.json({ message: 'Affiliate link updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT increment click count
router.put('/click/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE AffiliateLink SET click_count = click_count + 1 WHERE link_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Affiliate link not found' });
    res.json({ message: 'Click recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE affiliate link
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM AffiliateLink WHERE link_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Affiliate link not found' });
    res.json({ message: 'Affiliate link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
