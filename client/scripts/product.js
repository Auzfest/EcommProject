document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');  // Get the product ID from the query string

    fetch(`http://localhost:5000/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-price').textContent = `Price: $${product.price}`;
            document.getElementById('product-image').src = product.image_url;
            document.getElementById('product-image').alt = product.name;

            document.getElementById('add-to-cart').addEventListener('click', () => {
                addToCart(product.id);
            });
        })
        .catch(error => console.error('Error fetching product details:', error));
});

function addToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';  // Redirect to login if the user is not authenticated
        return;
    }

    fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
    .then(response => {
        if (response.ok) {
            alert('Product added to cart');
        } else {
            alert('Failed to add product to cart');
        }
    })
    .catch(error => console.error('Error adding product to cart:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Fetch product details and reviews
    fetchProductDetails(productId);
    fetchProductReviews(productId);

    // Handle review submission
    document.getElementById('submit-review-button').addEventListener('click', () => {
        submitReview(productId);
    });
});

function fetchProductDetails(productId) {
    fetch(`http://localhost:5000/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-price').textContent = `Price: $${product.price}`;
            document.getElementById('product-image').src = product.image_url;
            document.getElementById('product-image').alt = product.name;
        })
        .catch(error => console.error('Error fetching product details:', error));
}

function fetchProductReviews(productId) {
    fetch(`http://localhost:5000/api/reviews/${productId}`)
        .then(response => response.json())
        .then(reviews => {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = '';  // Clear existing reviews

            reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'review';
                reviewDiv.innerHTML = `
                    <h4>${review.username}</h4>
                    <p>Rating: ${review.rating}</p>
                    <p>${review.comment}</p>
                    <p><small>Posted on: ${new Date(review.created_at).toLocaleDateString()}</small></p>
                `;
                reviewsList.appendChild(reviewDiv);
            });
        })
        .catch(error => console.error('Error fetching reviews:', error));
}

function submitReview(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const comment = document.getElementById('review-comment').value;
    const rating = document.getElementById('review-rating').value;

    fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ product_id: productId, rating, comment })
    })
    .then(response => response.json())
    .then(data => {
        alert('Review submitted successfully');
        fetchProductReviews(productId);  // Refresh the list of reviews
    })
    .catch(error => console.error('Error submitting review:', error));
}
