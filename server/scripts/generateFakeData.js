

//THIS FILE IS ONLY FOR GENERATING FAKE DATA IN THE TERMINAL. NOT TO BE USED ANYWHERE ELSE.





const { faker } = require('@faker-js/faker');
const pool = require('../db');

async function insertFakeProducts() {
    for (let i = 0; i < 100; i++) {
        const name = faker.commerce.productName();
        const description = faker.commerce.productDescription();
        const price = faker.commerce.price({ min: 20, max: 1500 })
        const image_url = faker.image.urlLoremFlickr({ category: 'computers' })
        const stock_quantity = faker.number.int({ min: 1, max: 100 });
        const category = faker.commerce.productAdjective();

        await pool.query(
            `INSERT INTO products (name, description, price, image_url, stock_quantity, category)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, description, price, image_url, stock_quantity, category]
        );
    }
    console.log('Fake products inserted');
    pool.end();
}

insertFakeProducts();




async function insertFakeUsers() {
    for (let i = 0; i < 50; i++) {
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(); //Normally these would be hashed when made, but for the sake of this project, we will leave them as is.
        const role = 'customer';

        await pool.query(
            `INSERT INTO users (username, email, password, role)
             VALUES ($1, $2, $3, $4)`,
            [username, email, password, role]
        );
    }
    console.log('Fake users inserted');
}

insertFakeUsers();



