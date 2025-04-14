document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
  
    hamburger?.addEventListener('click', () => {
      navMenu?.classList.toggle('active');
    });
  
    // Product Fetching
    const productGrid = document.getElementById('productGrid');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const errorMessage = document.querySelector('.error-message');
  
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('.notification-badge');
  
    function showLoading() {
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      if (productGrid) productGrid.innerHTML = '';
      if (errorMessage) errorMessage.style.display = 'none';
    }
  
    function hideLoading() {
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  
    function showError(msg) {
      if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
      }
    }
  
    function renderProducts(products) {
      if (!productGrid) return;
      productGrid.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-card">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            <h3>${product.title.substring(0, 20)}${product.title.length > 20 ? '...' : ''}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
          </div>
        </a>
      `).join('');
    }
  
    // Initial Product Load
    if (localStorage.getItem('cachedProducts')) {
      renderProducts(JSON.parse(localStorage.getItem('cachedProducts')));
      hideLoading();
    } else {
      showLoading();
      fetch('https://fakestoreapi.com/products')
        .then(response => {
          if (!response.ok) throw new Error('Network error');
          return response.json();
        })
        .then(products => {
          localStorage.setItem('cachedProducts', JSON.stringify(products));
          renderProducts(products);
          hideLoading();
        })
        .catch(error => {
          hideLoading();
          showError('Failed to load products. Please refresh.');
          console.error(error);
        });
    }
  
    // Cart System
    function updateCartCount() {
      if (cartBadge) {
        cartBadge.textContent = cart.length;
      }
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  
    function getProductById(id) {
      const cachedProducts = JSON.parse(localStorage.getItem('cachedProducts')) || [];
      return cachedProducts.find(p => p.id == id);
    }
  
    window.addToCart = function(productId) {
      const product = getProductById(productId);
      const selectedSize = document.querySelector('.variation-select')?.value || 'N/A';
      const quantity = parseInt(document.getElementById('quantity')?.value || 1);
  
      if (product) {
        const cartItem = {
          ...product,
          size: selectedSize,
          quantity: quantity,
          total: (product.price * quantity).toFixed(2)
        };
  
        cart.push(cartItem);
        updateCartCount();
        showCartFeedback();
      }
    };
  
    function showCartFeedback() {
      const feedback = document.createElement('div');
      feedback.className = 'cart-feedback';
      feedback.textContent = 'Item added to cart! ✓';
      document.body.appendChild(feedback);
  
      setTimeout(() => {
        feedback.remove();
      }, 2000);
    }
  
    // Initialize Cart
    updateCartCount();
  });
  