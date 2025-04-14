document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
  
    const cachedProducts = JSON.parse(localStorage.getItem('cachedProducts')) || [];
    const product = cachedProducts.find(p => p.id == productId);
  
    if (product) {
      renderProductDetail(product);
    } else {
      fetch(`https://fakestoreapi.com/products/${productId}`)
        .then(res => res.json())
        .then(renderProductDetail)
        .catch(() => {
          document.getElementById('productDetail').innerHTML = `
            <div class="error-message">Product not found</div>
          `;
        });
    }
  });
  
  function renderProductDetail(product) {
    const container = document.getElementById('productDetail');
    const sizeOptions = product.category === 'clothing' ? `
        <option>S</option>
        <option>M</option>
        <option>L</option>
    ` : '';
  
    container.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h1>${product.title}</h1>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <p class="product-description">${product.description}</p>
        <select class="variation-select">
          <option>Select Size</option>
          ${sizeOptions}
        </select>
        <div class="interactive-elements">
          <div class="quantity-selector">
            <button class="qty-btn" onclick="adjustQuantity(-1)">−</button>
            <input type="number" id="quantity" value="1" min="1" max="10">
            <button class="qty-btn" onclick="adjustQuantity(1)">+</button>
          </div>
          <div class="total-price">
            Total: $<span id="totalPrice">${product.price.toFixed(2)}</span>
          </div>
        </div>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
  
    initInteractiveFeatures(product);
  }
  
  let basePrice = 0;
  let currentQuantity = 1;
  
  function initInteractiveFeatures(product) {
    basePrice = product.price;
    updateTotalPrice();
  
    // Image Zoom
    const productImage = document.querySelector('.product-image');
    const zoomOverlay = document.querySelector('.zoom-overlay');
  
    if (productImage) {
      productImage.addEventListener('mousemove', (e) => {
        if (window.matchMedia("(hover: hover)").matches) {
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          productImage.style.transformOrigin = `${x}px ${y}px`;
        }
      });
  
      productImage.addEventListener('click', () => {
        if (window.matchMedia("(hover: none)").matches && zoomOverlay) {
          zoomOverlay.style.display = 'block';
          productImage.classList.add('zoomed');
        }
      });
    }
  
    if (zoomOverlay) {
      zoomOverlay.addEventListener('click', () => {
        zoomOverlay.style.display = 'none';
        productImage?.classList.remove('zoomed');
      });
    }
  
    // Size Variation
    const variationSelect = document.querySelector('.variation-select');
    if (variationSelect) {
      variationSelect.addEventListener('change', (e) => {
        const sizePriceMap = { S: 0, M: 2, L: 4 };
        const priceAdjustment = sizePriceMap[e.target.value] || 0;
        basePrice = product.price + priceAdjustment;
        updateTotalPrice();
      });
    }
  
    // Mobile Touch Handling
    document.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const change = btn.textContent.trim() === '+' ? 1 : -1;
        adjustQuantity(change);
      });
    });
  }
  
  function adjustQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
  
    let newVal = parseInt(quantityInput.value) + change;
    newVal = Math.max(1, Math.min(10, newVal));
    quantityInput.value = newVal;
    currentQuantity = newVal;
    updateTotalPrice();
  }
  
  function updateTotalPrice() {
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) {
      totalPriceEl.textContent = (basePrice * currentQuantity).toFixed(2);
    }
  }
  