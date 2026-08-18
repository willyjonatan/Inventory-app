const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Inventory API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
    console.log('Inventory Management System API');
    console.log('Health check: http://localhost:' + PORT + '/api/health');
});