const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../../middleware/auth.js');

// Route to get all products
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Product not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/productsFiltered', async (req, res) => {
    try {
        const { product_name, min_price, max_price, categories } = req.query;

        let query = 'SELECT * FROM products WHERE TRUE';
        let queryParams = [];

        if (product_name) {
            query += ' AND name ILIKE $' + (queryParams.length + 1);
            queryParams.push(`%${product_name}%`);
        }

        if (min_price) {
            query += ' AND price >= $' + (queryParams.length + 1);
            queryParams.push(min_price);
        }

        if (max_price) {
            query += ' AND price <= $' + (queryParams.length + 1);
            queryParams.push(max_price);
        }

        if (categories) {
            const categoryList = categories.split(',');  // Handle multiple categories
            const placeholders = categoryList.map((_, i) => `$${queryParams.length + i + 1}`).join(',');
            query += ` AND category IN (${placeholders})`;
            queryParams = queryParams.concat(categoryList);
        }

        const products = await pool.query(query, queryParams);
        res.json(products.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/products', auth, async (req, res) => {
    const { name, description, price, category, stock_quantity, image_url } = req.body;
    const user_id = req.user.user_id;

    // Check if the user is an admin
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (!user.rows[0].role === 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const newProduct = await pool.query(
            'INSERT INTO products (name, description, price, category, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, category, stock_quantity, image_url]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/products/:id', auth, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Check if the user is an admin
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [user_id]);
    if (!user.rows[0].role === 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
