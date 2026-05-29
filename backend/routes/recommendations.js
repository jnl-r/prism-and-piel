const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { genId } = require('../utils/genId');

// GET all recommendation logs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM RecommendationLog');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recommendation logs for a specific user
router.get('/user/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM RecommendationLog WHERE user_id = ? ORDER BY generated_at DESC',
      [req.params.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single log entry
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM RecommendationLog WHERE log_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Log not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { profile_id } = req.body;

    // Fetch the skin profile to use
    let profileQuery = 'SELECT * FROM SkinProfile WHERE user_id = ?';
    const profileParams = [user_id];
    if (profile_id) {
      profileQuery += ' AND profile_id = ?';
      profileParams.push(profile_id);
    } else {
      profileQuery += ' ORDER BY profile_id ASC LIMIT 1';
    }
    const [profiles] = await db.query(profileQuery, profileParams);
    if (profiles.length === 0)
      return res.status(404).json({ error: 'No skin profile found for this user' });

    const profile = profiles[0];

    // Find matching variants: match undertone and preferred_finish from Product.
    const [variants] = await db.query(
      `SELECT
         pv.variant_id,
         pv.product_id,
         pv.shade_name,
         pv.shade_hex,
         pv.product_variant_img,
         pv.recommended_undertone,
         p.product_name,
         p.brand_name,
         p.category,
         p.finish,
         p.product_img,
         COALESCE(AVG(r.rating), 0) AS avg_rating,
         COUNT(r.review_id)         AS review_count
       FROM ProductVariant pv
       JOIN Product p ON p.product_id = pv.product_id
       LEFT JOIN Review r ON r.variant_id = pv.variant_id
       WHERE pv.recommended_undertone = ?
         AND (p.finish = ? OR p.finish IS NULL)
       GROUP BY pv.variant_id
       ORDER BY avg_rating DESC
       LIMIT 10`,
      [profile.undertone, profile.preferred_finish]
    );

    // Log each recommendation (variant surrogate key only)
    for (let i = 0; i < variants.length; i++) {
      const log_id = await genId(db, 'RecommendationLog', 'log_id', 'LOG');
      await db.query(
        `INSERT INTO RecommendationLog (log_id, user_id, variant_id, rank_position, clicked)
         VALUES (?, ?, ?, ?, FALSE)`,
        [log_id, user_id, variants[i].variant_id, i + 1]
      );
    }

    res.status(201).json({
      profile_used: { profile_id: profile.profile_id, profile_label: profile.profile_label },
      recommendations: variants,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST manually log a recommendation entry
router.post('/', async (req, res) => {
  try {
    const { user_id, variant_id, rank_position } = req.body;
    if (!user_id || !variant_id)
      return res.status(400).json({ error: 'user_id and variant_id are required' });

    const log_id = await genId(db, 'RecommendationLog', 'log_id', 'LOG');
    await db.query(
      'INSERT INTO RecommendationLog (log_id, user_id, variant_id, rank_position, clicked) VALUES (?, ?, ?, ?, FALSE)',
      [log_id, user_id, variant_id, rank_position || null]
    );
    res.status(201).json({ log_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT mark recommendation as clicked
router.put('/click/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE RecommendationLog SET clicked = TRUE WHERE log_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Recommendation marked as clicked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE log entry
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM RecommendationLog WHERE log_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
