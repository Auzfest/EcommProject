const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const pool = require('../db');

// Get the current user's cart
router.get('/cart', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Retrieve the user's active cart
        const cart = await pool.query(
            `SELECT carts.id AS cart_id, products.*, cart_items.quantity 
             FROM carts 
             JOIN cart_items ON carts.id = cart_items.cart_id 
             JOIN products ON cart_items.product_id = products.id 
             WHERE carts.user_id = $1`,
            [userId]
        );

        if (cart.rows.length === 0) {
            return res.json({ cart: [], message: 'Cart is empty' });
        }

        res.json({ cart: cart.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add item to cart
router.post('/cart', auth, async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.user_id;

    try {
        // Get the user's active cart or create one if it doesn't exist
        let cart = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1',
            [userId]
        );

        if (cart.rows.length === 0) {
            cart = await pool.query(
                'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
                [userId]
            );
        }

        const cartId = cart.rows[0].id;

        // Check if the product is already in the cart
        const existingItem = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, product_id]
        );

        if (existingItem.rows.length > 0) {
            // Update the quantity if the product is already in the cart
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3',
                [quantity, cartId, product_id]
            );
        } else {
            // Add the product to the cart
            await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
                [cartId, product_id, quantity]
            );
        }

        res.json({ message: 'Product added to cart' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Remove item from cart
router.delete('/cart', auth, async (req, res) => {
    const { product_id } = req.body;
    const userId = req.user.user_id;

    try {
        // Get the user's active cart
        const cart = await pool.query(
            'SELECT * FROM carts WHERE user_id = $1',
            [userId]
        );

        if (cart.rows.length === 0) {
            return res.status(400).json({ message: 'Cart not found' });
        }

        const cartId = cart.rows[0].id;

        // Remove the product from the cart
        await pool.query(
            'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, product_id]
        );

        res.json({ message: 'Product removed from cart' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Checkout route
router.post('/checkout', auth, async (req, res) => {
    const userId = req.user.user_id;

    try {
        // Fetch the user's cart items
        const cartItems = await pool.query(
            'SELECT cart_items.*, products.price FROM cart_items JOIN products ON cart_items.product_id = products.id WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1 AND checked_out = FALSE)',
            [userId]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // Calculate the total amount
        let totalAmount = 0;
        cartItems.rows.forEach(item => {
            totalAmount += item.quantity * item.price;
        });

        // Create the order
        const newOrder = await pool.query(
            'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, totalAmount, 'pending']
        );
        const orderId = newOrder.rows[0].id;

        // Insert order items
        const orderItemsPromises = cartItems.rows.map(item => {
            return pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.product_id, item.quantity, item.price, item.quantity * item.price]
            );
        });
        await Promise.all(orderItemsPromises);

        // Mark the cart as checked out
        await pool.query('UPDATE carts SET checked_out = TRUE WHERE user_id = $1 AND checked_out = FALSE', [userId]);

        res.json({ message: 'Order placed successfully', orderId: orderId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user's past orders
router.get('/orders', auth, async (req, res) => {
    const userId = req.user.user_id;

    try {
        // Fetch the user's past orders
        const orders = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        if (orders.rows.length === 0) {
            return res.status(404).json({ message: 'No past orders found' });
        }

        // Fetch the order items for each order
        const orderDetailsPromises = orders.rows.map(order => {
            return pool.query(
                'SELECT order_items.*, products.name FROM order_items JOIN products ON order_items.product_id = products.id WHERE order_id = $1',
                [order.id]
            );
        });

        const ordersWithItems = await Promise.all(orderDetailsPromises);

        const ordersData = orders.rows.map((order, index) => {
            return {
                order: order,
                items: ordersWithItems[index].rows
            };
        });

        res.json(ordersData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;