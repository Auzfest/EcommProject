document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetchPastOrders();

    // Other existing event listeners
});

function fetchPastOrders() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    })
    .then(response => response.json())
    .then(orders => {
        const ordersList = document.getElementById('carts');
        ordersList.innerHTML = '';  // Clear previous content

        if (orders.message) {
            ordersList.innerHTML = `<p>${orders.message}</p>`;
            return;
        }

        orders.forEach(orderData => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order';

            const orderInfo = `
                <h3>Order #${orderData.order.id}</h3>
                <p>Date: ${new Date(orderData.order.created_at).toLocaleDateString()}</p>
                <p>Total Amount: $${orderData.order.total_price}</p>
                <h4>Items:</h4>
                <ul>
                    ${orderData.items.map(item => `
                        <li>${item.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>
                    `).join('')}
                </ul>
            `;
            orderDiv.innerHTML = orderInfo;
            ordersList.appendChild(orderDiv);
        });
    })
    .catch(error => console.error('Error fetching past orders:', error));
}
