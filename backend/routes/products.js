const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

/* Derive the image path from product_id (which always uses the correct hyphen),
   so a wrong separator stored in product_img (e.g. "PRD_001") can't break the
   <img> on the frontend. Assumes each product image file is named <product_id>.png. */
function fixImg(row) {
  if (!row) return row;
  return { ...row, product_img: `/assets/${row.product_id}.png` };
}

// GET all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Product');
    res.json(rows.map(fixImg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Product WHERE category = ?',
      [req.params.category]
    );
    res.json(rows.map(fixImg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Product WHERE product_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(fixImg(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const { product_name, brand_name, category, formula_type, finish, description, product_img } = req.body;
    if (!product_name || !brand_name || !category || !description)
      return res.status(400).json({ error: 'product_name, brand_name, category, and description are required' });

    const product_id = await genId(db, 'Product', 'product_id', 'PRD');
    await db.query(
      `INSERT INTO Product (product_id, product_name, brand_name, category, formula_type, finish, description, product_img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, product_name, brand_name, category, formula_type || null, finish || null, description, product_img || null]
    );
    res.status(201).json({ product_id, product_name, brand_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const { product_name, brand_name, category, formula_type, finish, description, product_img } = req.body;
    const [result] = await db.query(
      `UPDATE Product
       SET product_name = ?, brand_name = ?, category = ?, formula_type = ?, finish = ?, description = ?, product_img = ?
       WHERE product_id = ?`,
      [product_name, brand_name, category, formula_type || null, finish || null, description, product_img || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Product WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;