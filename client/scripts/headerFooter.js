const header = document.getElementById('header');
const footer = document.getElementById('footer');

//check if user is logged in
const token = localStorage.getItem('token');
    if (!token) {
        header.innerHTML = `        
        <h1>THINGS AND STUFF</h1>
        <section id="profile_header">
        <div id="cart"><a href="cart.html"><img src="/client/images/cart.webp" alt="profile picture"></a></div>
        <div id="userAccess"><a href="profile.html"><img src="/client/images/profile_placeholder.webp" alt="profile picture"></a></div>
        <a href="../pages/login.html" id="logout">Login</a>
        </section>
        <nav>
            <a href="index.html">Home</a>
            <a href="products.html">Products</a>
        </nav>
        `;
    }
    else{
        header.innerHTML = `        
        <h1>THINGS AND STUFF</h1>
        <section id="profile_header">
        <div id="cart"><a href="cart.html"><img src="/client/images/cart.webp" alt="profile picture"></a></div>
        <div id="userAccess"><a href="profile.html"><img src="/client/images/profile_placeholder.webp" alt="profile picture"></a></div>
        <a href="../pages/login.html" id="logout">Logout</a>
        </section>
        <nav>
            <a href="index.html">Home</a>
            <a href="products.html">Products</a>
        </nav>
        `;
    }

footer.innerHTML = `
            <h3>&copy; 2024 THINGS AND STUFF</h3>
        <p>*This is a fake e-commerce site. No products are actually available for purchase.*</p>
        <a href="index.html">Home</a>
        <h4>Created By Austin Barnes</h4>
        <p>Contact: <a href="https://auzfest.github.io/ThomasAustinBarnesIV/contact.html" target=_blank>Here</a></p>
        `;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');  // Remove the JWT token from localStorage
    window.location.href = '/login.html';  // Redirect to the login page
});