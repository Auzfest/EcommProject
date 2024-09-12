const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign({ user_id: newUser.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if the password matches
        if (password !== user.rows[0].password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // for hashed passwords
        // const validPassword = await bcrypt.compare(password, user.rows[0].password);
        // if (!validPassword) {
        //     return res.status(400).json({ error: 'Invalid credentials' });
        // }

        // Create JWT token
        const token = jwt.sign({ user_id: user.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        console.log('Generated Token:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



const auth = require('../../middleware/auth.js');

// User profile update route
router.put('/profile', auth, async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.user_id;

    try {
        // Hash the new password if provided
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update the user's profile
        const updatedUser = await pool.query(
            `UPDATE users 
             SET username = $1, email = $2, password = COALESCE($3, password) 
             WHERE id = $4 
             RETURNING *`,
            [username, email, hashedPassword, userId]
        );

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Route to get the current user's data
router.get('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;  // The user ID from the JWT payload
        const user = await pool.query('SELECT username, email, role FROM users WHERE id = $1', [userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/auth/profile', auth, async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.user_id;

    try {
        //normally hash the password
        // const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const updatedUser = await pool.query(
            `UPDATE users 
             SET username = $1, email = $2, password = COALESCE($3, password) 
             WHERE id = $4 
             RETURNING username, email`,
            [username, email, password, userId]
        );

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
