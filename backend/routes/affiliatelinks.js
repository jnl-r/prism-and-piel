const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

// GET all affiliate links
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM AffiliateLink');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET affiliate links for a specific product (e.g. /product/PRD-001)
router.get('/product/:product_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM AffiliateLink WHERE product_id = ?',
      [req.params.product_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single affiliate link by ID (e.g. LNK-001)
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

// POST create affiliate link (one per product)
router.post('/', async (req, res) => {
  try {
    const { product_id, affiliate_url } = req.body;
    if (!product_id || !affiliate_url)
      return res.status(400).json({ error: 'product_id and affiliate_url are required' });

    const link_id = await genId(db, 'AffiliateLink', 'link_id', 'LNK');
    await db.query(
      'INSERT INTO AffiliateLink (link_id, product_id, affiliate_url, click_count) VALUES (?, ?, ?, 0)',
      [link_id, product_id, affiliate_url]
    );
    res.status(201).json({ link_id, product_id });
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
