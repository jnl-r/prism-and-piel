const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all variants
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ProductVariant');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all variants for a product
router.get('/product/:product_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ProductVariant WHERE product_id = ?',
      [req.params.product_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single variant by composite PK
router.get('/:product_id/:variant_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ProductVariant WHERE product_id = ? AND variant_id = ?',
      [req.params.product_id, req.params.variant_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Variant not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create variant
router.post('/', async (req, res) => {
  try {
    console.log('VARIANT POST BODY:', req.body);
    const { product_id, variant_id, shade_name, shade_hex, recommended_undertone } = req.body;
    if (!product_id || !variant_id || !shade_name)
      return res.status(400).json({ error: 'product_id, variant_id, and shade_name are required' });

    await db.query(
      `INSERT INTO ProductVariant (variant_id, product_id, shade_name, shade_hex, recommended_undertone)
       VALUES (?, ?, ?, ?, ?)`,
      [variant_id, product_id, shade_name, shade_hex || null, recommended_undertone || null]
    );
    res.status(201).json({ message: 'Variant created successfully', product_id, variant_id });
  } catch (err) {
    console.error('VARIANT POST ERROR:', err);
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Variant with that variant_id already exists for this product' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update variant
router.put('/:product_id/:variant_id', async (req, res) => {
  try {
    const { shade_name, shade_hex, recommended_undertone } = req.body;
    const [result] = await db.query(
      `UPDATE ProductVariant
       SET shade_name = ?, shade_hex = ?, recommended_undertone = ?
       WHERE product_id = ? AND variant_id = ?`,
      [shade_name, shade_hex || null, recommended_undertone || null,
       req.params.product_id, req.params.variant_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Variant not found' });
    res.json({ message: 'Variant updated successfully' });
  } catch (err) {
    console.error('VARIANT PUT ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE variant (cascades to AffiliateLink, Review, RecommendationLog)
router.delete('/:product_id/:variant_id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM ProductVariant WHERE product_id = ? AND variant_id = ?',
      [req.params.product_id, req.params.variant_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Variant not found' });
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    console.error('VARIANT DELETE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;