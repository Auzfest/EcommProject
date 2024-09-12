const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../../middleware/auth.js');

// Add a review for a product
router.post('/reviews', auth, async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.user_id;

    try {
        const newReview = await pool.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, user_id, rating, comment]
        );

        res.json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get reviews for a specific product
router.get('/reviews/:product_id', async (req, res) => {
    const { product_id } = req.params;

    try {
        const reviews = await pool.query(
            'SELECT reviews.*, users.username FROM reviews JOIN users ON reviews.user_id = users.id WHERE product_id = $1',
            [product_id]
        );

        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get reviews by the logged-in user
router.get('/my-reviews', auth, async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const reviews = await pool.query(
            'SELECT reviews.*, products.name AS product_name FROM reviews JOIN products ON reviews.product_id = products.id WHERE user_id = $1',
            [user_id]
        );

        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update a review
router.put('/reviews/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.user_id;

    try {
        // Ensure the review belongs to the logged-in user
        const review = await pool.query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [id, user_id]);

        if (review.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const updatedReview = await pool.query(
            'UPDATE reviews SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [rating, comment, id]
        );

        res.json(updatedReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete a review
router.delete('/reviews/:id', auth, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    try {
        // Ensure the review belongs to the logged-in user
        const review = await pool.query('SELECT * FROM reviews WHERE id = $1 AND user_id = $2', [id, user_id]);

        if (review.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
