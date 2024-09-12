function toggleFilters() {
    const filterBox = document.getElementById('filter-choices');
    const toggleButton = document.getElementById('collapse');
    const main = document.getElementById('products-main');
    if (filterBox.classList.contains('hidden')) {
        filterBox.classList.remove('hidden');
        toggleButton.innerHTML = 'Close Filters';
        main.style.gridTemplateRows = '120px 800px 1fr';

    } else {
        filterBox.classList.add('hidden');
        toggleButton.innerHTML = 'Open Filters';
        main.style.gridTemplateRows = '120px 60px 1fr';
    }
}


/*********************************
Fetch and display products
*********************************/

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/api/products')
        .then(response => response.json())
        .then(data => {
            const productsContainer = document.getElementById('products-container');
            data.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';

                productDiv.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name} loading="lazy"">
                    <h3>${product.name}</h3>
                    <h4>${product.category}</h4>
                    <p class='price'>$${product.price}</p>
                    <a href="product.html?id=${product.id}">View Details</a>
                `;
                
                productsContainer.appendChild(productDiv);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
});

/*********************************
Filter products
********************************/

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:5000/api/products')
        .then(response => response.json())
        .then(products => {
            const categories = [...new Set(products.map(product => product.category))];
            const categoriesContainer = document.getElementById('categories');
            
            categories.forEach(category => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = category;
                checkbox.id = category;
                categoriesContainer.appendChild(checkbox);

                const label = document.createElement('label');
                label.htmlFor = category;
                label.textContent = category;
                categoriesContainer.appendChild(label);

                categoriesContainer.appendChild(document.createElement('br'));
            });
        })
        .catch(error => console.error('Error fetching categories:', error));

document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('search-name').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.querySelectorAll('#categories input').forEach(checkbox => checkbox.checked = false);
    fetch('http://localhost:5000/api/products')
        .then(response => response.json())
        .then(data => {
            const productsContainer = document.getElementById('products-container');
            productsContainer.innerHTML = '';
            data.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';

                productDiv.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name} loading="lazy"">
                    <h3>${product.name}</h3>
                    <h4>${product.category}</h4>
                    <p class='price'>$${product.price}</p>
                    <a href="product.html?id=${product.id}">View Details</a>
                `;
                
                productsContainer.appendChild(productDiv);
            });
        })
        .catch(error => console.error('Error fetching products:', error));
});



document.getElementById('apply-filter').addEventListener('click', () => {
    const searchName = document.getElementById('search-name').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const selectedCategories = Array.from(document.querySelectorAll('#categories input:checked')).map(checkbox => checkbox.value);

    let filters = [];

    if (searchName) {
        filters.push(`product_name=${encodeURIComponent(searchName)}`);
    }
    if (minPrice) {
        filters.push(`min_price=${encodeURIComponent(minPrice)}`);
    }
    if (maxPrice) {
        filters.push(`max_price=${encodeURIComponent(maxPrice)}`);
    }
    if (selectedCategories.length) {
        filters.push(`categories=${encodeURIComponent(selectedCategories.join(','))}`);
    }

    filters = filters.length ? `?${filters.join('&')}` : '';


/*********************************
Fetch and display filtered products
*********************************/

    fetch(`http://localhost:5000/api/productsFiltered${filters}`)
        .then(response => response.json())
        .then(products => {
            const productsList = document.getElementById('products-container');
            productsList.innerHTML = '';

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name} loading="lazy"">
                    <h3>${product.name}</h3>
                    <h4>${product.category}</h4>
                    <p class='price'>$${product.price}</p>
                    <a href="product.html?id=${product.id}">View Details</a>
                `;
                productsList.appendChild(productDiv);
            });
        })
        .catch(error => console.error('Error fetching filtered products:', error));
});
});
