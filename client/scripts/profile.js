/*********************************
User Information
*********************************/


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
        window.location.href = '/pages/login.html';  // Redirect to login if no token
        console.log('No token found');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token  // Include the JWT token in the headers
            }
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User Data:', userData);
            localStorage.setItem('username', userData.username);
            localStorage.setItem('email', userData.email);
            localStorage.setItem('password', userData.password);
            document.getElementById('username').textContent = userData.username;
            document.getElementById('account-info').innerHTML = `Username: ${userData.username} <br><br>
            Email: ${userData.email} <br><br>
            Role: ${userData.role}`;

        } else {
            // Handle errors (e.g., token expired, user not found)
            console.error('Failed to fetch user data');
            //localStorage.removeItem('token');
            window.location.href = '/pages/login.html';
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('token');
        window.location.href = '/pages/login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const editAccountButton = document.getElementById('edit-account-button');
    const overlay = document.getElementById('overlay');
    const cancelButton = document.getElementById('cancel-button');
    const saveChangesButton = document.getElementById('save-changes-button');

    // Open overlay when Edit Account button is clicked
    editAccountButton.addEventListener('click', () => {
        overlay.style.display = 'block';
        // Optionally, preload user data into the form fields
        loadUserDataIntoForm();
    });

    // Close overlay when Cancel button is clicked
    cancelButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    // Handle saving changes
    saveChangesButton.addEventListener('click', () => {
        saveAccountChanges();
    });
});

function loadUserDataIntoForm() {
    // Fetch current user data from the server or localStorage and pre-fill the form
    const username = document.getElementById('username').textContent;
    document.getElementById('edit-username').value = username;

    // Assuming you have more user details stored
    // For example:
    const email = localStorage.getItem('email');
    document.getElementById('edit-email').value = email;
}

function saveAccountChanges() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const updatedUsername = document.getElementById('edit-username').value;
    const updatedEmail = document.getElementById('edit-email').value;
    const updatedPassword = document.getElementById('edit-password').value;

    fetch('http://localhost:5000/api/users/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ username: updatedUsername, email: updatedEmail, password: updatedPassword })
    })
    .then(response => response.json())
    .then(data => {
        alert('Account updated successfully');
        // Update the displayed username
        document.getElementById('username').textContent = data.username;
        // Hide the overlay
        document.getElementById('overlay').style.display = 'none';
    })
    .catch(error => console.error('Error updating account:', error));
}


/*********************************
User Reviews
*********************************/

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    fetchUserReviews();

    // Event delegation for edit and delete buttons
    document.getElementById('reviews-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-review')) {
            editReview(event.target.dataset.reviewId);
        } else if (event.target.classList.contains('delete-review')) {
            deleteReview(event.target.dataset.reviewId);
        }
    });
});

function fetchUserReviews() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/my-reviews', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    })
    .then(response => response.json())
    .then(reviews => {
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';

        if (reviews.length === 0) {
            reviewsList.innerHTML = 'No reviews yet.';
            return;
        }
        else {
            reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'user-review';
                reviewDiv.innerHTML = `
                    <h3>Product: ${review.product_name}</h3>
                    <p>Rating: ${review.rating}</p>
                    <p>${review.comment}</p>
                    <button class="edit-review" data-review-id="${review.id}">Edit</button>
                    <button class="delete-review" data-review-id="${review.id}">Delete</button>
                `;
                reviewsList.appendChild(reviewDiv);
            });
        }
    })
    .catch(error => console.error('Error fetching reviews:', error));
}

function editReview(reviewId) {
    const token = localStorage.getItem('token');
    const newRating = prompt('Enter new rating (1-5):');
    const newComment = prompt('Enter new comment:');

    fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
    })
    .then(response => response.json())
    .then(data => {
        alert('Review updated successfully');
        fetchUserReviews();  // Refresh the list of reviews
    })
    .catch(error => console.error('Error updating review:', error));
}

function deleteReview(reviewId) {
    const token = localStorage.getItem('token');

    if (confirm('Are you sure you want to delete this review?')) {
        fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Review deleted successfully');
                fetchUserReviews();  // Refresh the list of reviews
            } else {
                alert('Failed to delete review');
            }
        })
        .catch(error => console.error('Error deleting review:', error));
    }
}

/*********************************
Admin Controls
*********************************/

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

const approved =checkIfAdmin();

// Event listeners for admin controls
if (approved) {
document.getElementById('add-product-button').addEventListener('click', addProduct);
document.getElementById('delete-product-button').addEventListener('click', deleteProduct);
}
});

function checkIfAdmin() {
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/users/profile', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
    }
})
.then(response => response.json())
.then(data => {
    console.log(data);
    if (data.role === 'admin') {
        document.getElementById('admin-controls').style.display = 'block';
        const adminControls = document.getElementById('admin-controls');
        adminControls.innerHTML = `
            <h2>Admin Controls</h2>
    <form>
        <h3>Add Product</h3>
        <input type="text" id="product-name" placeholder="Product Name">
        <input type="text" id="product-description" placeholder="Product Description">
        <input type="number" id="product-price" placeholder="Price">
        <input type="text" id="product-category" placeholder="Category">
        <input type="number" id="stock_quantity" placeholder="Stock Quantity">
        <input type="text" id="product-image-url" placeholder="Image URL">
        <button id="add-product-button" onclick="addProduct()">Add Product</button>
    </form>
    <form>
        <h3>Delete Product</h3>
        <input type="number" id="delete-product-id" placeholder="Product ID">
        <button id="delete-product-button" onclick="deleteProduct()">Delete Product</button>
    </form>
    `
    return true;
} else {
    return false;
}
})
.catch(error => console.error('Error checking admin status:', error));
}

function addProduct() {
const token = localStorage.getItem('token');
const name = document.getElementById('product-name').value;
const description = document.getElementById('product-description').value;
const price = document.getElementById('product-price').value;
const category = document.getElementById('product-category').value;
const stock_quantity = document.getElementById('stock_quantity').value;
const image_url = document.getElementById('product-image-url').value;

fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
    },
    body: JSON.stringify({ name, description, price, category, stock_quantity, image_url })
})
.then(response => response.json())
.then(data => {
    alert('Product added successfully');
    window.location.reload();
    console.log(data);
})
.catch(error => console.error('Error adding product:', error));
}

function deleteProduct() {
const token = localStorage.getItem('token');
const productId = document.getElementById('delete-product-id').value;

fetch(`http://localhost:5000/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
    }
})
.then(response => {
    if (response.ok) {
        alert('Product deleted successfully');
    } else {
        alert('Failed to delete product');
    }
})
.catch(error => console.error('Error deleting product:', error));
}


document.getElementById('past-button').addEventListener('click', () => {
    window.location.href = '../pages/past-carts.html';
});
