const express = require('express');
const { pool, testConnection } = require('./db');

const app = express();
const port = 3000;

// Middleware để parse JSON (nếu cần thêm API)
app.use(express.json());

// Health check endpoint - Test database connection
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 as health');
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// Endpoint chính - Lấy random excuse từ database
app.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT text FROM excuses ORDER BY RANDOM() LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return res.status(404).send('<h1>No excuses found in database</h1>');
        }
        
        const randomExcuse = result.rows[0].text;
        res.status(200).send(`<h1>${randomExcuse}</h1>`);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send(`<h1>Database connection error</h1><p>${error.message}</p>`);
    }
});

// API endpoint: Lấy tất cả excuses
app.get('/api/excuses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM excuses ORDER BY created_at DESC');
        res.json({
            count: result.rows.length,
            excuses: result.rows
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database connection error', message: error.message });
    }
});

// API endpoint: Thêm excuse mới
app.post('/api/excuses', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const result = await pool.query(
            'INSERT INTO excuses (text) VALUES ($1) RETURNING *',
            [text.trim()]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database connection error', message: error.message });
    }
});

// Export app instance for testing
module.exports = app;

// Start server only if this file is run directly (not when required)
if (require.main === module) {
    // Test database connection before starting server
    testConnection().then((connected) => {
        if (connected) {
            app.listen(port, () => {
                console.log(`🚀 Dev Excuse App listening on port ${port}`);
                console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
            });
        } else {
            console.error('❌ Failed to connect to database. Server not started.');
            process.exit(1);
        }
    });
}