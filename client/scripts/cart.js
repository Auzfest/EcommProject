document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
        });

        const data = await response.json();

        const itemsContainer = document.getElementById('items');
        itemsContainer.innerHTML = '';  // Clear previous content

        data.cart.forEach(item => {
            console.log(item);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <a href="product.html?id=${item.id}">
                <h3>${item.name}</h3>
                <img src="${item.image_url}" alt="${item.name}">
                </a>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${item.price}</p>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            `;
            itemsContainer.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
});




async function addToCart(productId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ product_id: productId, quantity }),
        });

        if (response.ok) {
            alert('Product added to cart');
        } else {
            alert('Failed to add product to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}




async function removeFromCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
            alert('Product removed from cart');
            window.location.reload();
        } else {
            alert('Failed to remove product from cart');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }

    document.getElementById('checkout-button').addEventListener('click', () => {
        checkout();
    });

    loadCartItems();
});

function checkout() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.orderId) {
            alert('Checkout successful! Your order ID is ' + data.orderId);
            const itemsContainer = document.getElementById('items');
            itemsContainer.innerHTML = '<p>Your cart is empty</p>';       
            window.location.href = 'pages/order-confirmation.html';
        } else {
            alert('Checkout failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error during checkout:', error));
}


document.getElementById('past-button').addEventListener('click', () => {
    window.location.href = '../pages/past-carts.html';
});
