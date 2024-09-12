require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const productsRoute = require('./routes/products');
app.use('/api', productsRoute);

const authRoute = require('./routes/users');
app.use('/api/users', authRoute);

const cartRoute = require('./routes/cart');
app.use('/api', cartRoute);

const reviewsRoute = require('./routes/reviews');
app.use('/api', reviewsRoute);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
