const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

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

// GET single variant
router.get('/:variant_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM ProductVariant WHERE variant_id = ?',
      [req.params.variant_id]
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
    const { product_id, shade_name, shade_hex, product_variant_img, recommended_undertone } = req.body;
    if (!product_id || !shade_name)
      return res.status(400).json({ error: 'product_id and shade_name are required' });

    const variant_id = await genId(db, 'ProductVariant', 'variant_id', 'VAR');
    await db.query(
      `INSERT INTO ProductVariant
         (variant_id, product_id, shade_name, shade_hex, product_variant_img, recommended_undertone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variant_id, product_id, shade_name, shade_hex || null, product_variant_img || null, recommended_undertone || null]
    );
    res.status(201).json({ variant_id, product_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update variant
router.put('/:variant_id', async (req, res) => {
  try {
    const { shade_name, shade_hex, product_variant_img, recommended_undertone } = req.body;
    const [result] = await db.query(
      `UPDATE ProductVariant
       SET shade_name = ?, shade_hex = ?, product_variant_img = ?, recommended_undertone = ?
       WHERE variant_id = ?`,
      [shade_name, shade_hex || null, product_variant_img || null, recommended_undertone || null,
       req.params.variant_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Variant not found' });
    res.json({ message: 'Variant updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE variant
router.delete('/:variant_id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM ProductVariant WHERE variant_id = ?',
      [req.params.variant_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Variant not found' });
    res.json({ message: 'Variant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
