const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'prism-and-piel API is running' });
});

module.exports = router;
