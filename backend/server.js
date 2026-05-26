const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.use('/api', require('./routes/index'));

// Routes
app.use('/api/users',           require('./routes/users'));
app.use('/api/skinprofiles',    require('./routes/skinprofiles'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/variants',        require('./routes/variants'));
app.use('/api/affiliatelinks',  require('./routes/affiliatelinks'));
app.use('/api/reviews',         require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const db = require('./config/db');
db.query('SELECT 1').then(() => console.log('✅ DB connected')).catch(err => console.error('❌ DB ERROR:', err.message));