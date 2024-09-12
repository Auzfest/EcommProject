//Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    // const data = await response.json();
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Save token to local storage
        window.location.href = '/pages/profile.html';  // Redirect to profile page
    } else {
        console.error(data.error);
    }
});

//Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token); // Save token to local storage
        window.location.href = '/profile.html';  // Redirect to profile page
    } else {
        console.error(data.error);
    }
});