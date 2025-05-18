document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // 1. Mobile Menu Toggle
    // =====================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
      mobileMenu.addEventListener('click', function() {
        this.classList.toggle('is-active');
        navMenu.classList.toggle('active');
      });
      
      document.querySelectorAll('.nav-links').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 960) {
            mobileMenu.classList.remove('is-active');
            navMenu.classList.remove('active');
          }
        });
      });
    }
  
    // =====================
    // 2. Image Slider (Fixed)
    // =====================
    const slides = document.querySelectorAll('.product-slider img');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
  
    function showSlide(index) {
      // Validate index
      if (index >= slides.length) {
        index = 0;
      } else if (index < 0) {
        index = slides.length - 1;
      }
      
      // Update slides
      slides.forEach(slide => slide.classList.remove('active'));
      slides[index].classList.add('active');
      
      // Update dots
      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');
      
      currentIndex = index;
    }
  
    // Navigation buttons
    document.getElementById('prev-slide')?.addEventListener('click', () => {
      showSlide(currentIndex - 1);
    });
  
    document.getElementById('next-slide')?.addEventListener('click', () => {
      showSlide(currentIndex + 1);
    });
  
    // Dot indicators
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });
  
    // Initialize first slide
    if (slides.length > 0) {
      showSlide(0);
    }
  
    // =====================
    // 3. Cart System
    // =====================
    const CART_KEY = 'projector_cart_sync';
    const PRODUCT_ID = 'hy300-pro-plus';
  
    function getCart() {
      try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || {};
      } catch (e) {
        console.error("Cart read error:", e);
        return {};
      }
    }
  
    function updateCart(productId, quantity) {
      const cart = getCart();
      if (quantity <= 0) {
        delete cart[productId];
      } else {
        cart[productId] = quantity;
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateCartCount();
      
      // Dispatch event for other pages
      const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
      document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: totalItems }
      }));
    }
  
    function updateCartCount() {
      const cart = getCart();
      const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
      
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
      });
    }
  
    // Add to cart button
    document.querySelector('.buy-button')?.addEventListener('click', function(e) {
      e.preventDefault();
      const cart = getCart();
      const currentQty = cart[PRODUCT_ID] || 0;
      updateCart(PRODUCT_ID, currentQty + 1);
      
      // Visual feedback
      const originalText = this.textContent;
      this.textContent = 'Added!';
      this.classList.add('clicked');
      
      setTimeout(() => {
        this.textContent = originalText;
        this.classList.remove('clicked');
      }, 1500);
    });
  
    // Listen for cart updates from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === CART_KEY) {
        updateCartCount();
      }
    });
  
    // Initialize cart count
    updateCartCount();
  });
  
  // =====================
  // CART PAGE FUNCTIONALITY
  // =====================
  function initializeCartPage() {
    const CART_KEY = 'projector_cart_sync';
    const PRODUCT_ID = 'hy300-pro-plus';
    const PRODUCT_PRICE = 1;
  
    function getCart() {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    }
  
    function renderCartItems() {
      const cart = getCart();
      const cartItemsContainer = document.querySelector('.cart-items');
      const cartSummary = document.querySelector('.cart-summary');
      
      if (!cart[PRODUCT_ID]) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <p>Your cart is empty</p>
            <a href="index.html" class="continue-shopping">Continue Shopping</a>
          </div>
        `;
        document.querySelector('.checkout-btn').style.display = 'none';
        document.getElementById('paypal-button-container').style.display = 'none';
        return;
      }
      
      const quantity = cart[PRODUCT_ID];
      const subtotal = PRODUCT_PRICE * quantity;
      
      cartItemsContainer.innerHTML = `
        <div class="cart-item">
          <img src="images/projector-front.jpg" alt="Magcubic Projector">
          <div class="item-details">
            <h2>Magcubic 4K HY300 Pro+ Projector</h2>
            <p class="item-price">$${PRODUCT_PRICE.toFixed(2)}</p>
            <div class="quantity-controls">
              <button class="quantity-btn minus">-</button>
              <span class="quantity">${quantity}</span>
              <button class="quantity-btn plus">+</button>
            </div>
          </div>
          <button class="remove-item"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
      document.querySelector('.total-price').textContent = `$${subtotal.toFixed(2)}`;
      
      // Add event listeners
      document.querySelector('.minus').addEventListener('click', () => {
        updateCart(PRODUCT_ID, quantity - 1);
      });
      
      document.querySelector('.plus').addEventListener('click', () => {
        updateCart(PRODUCT_ID, quantity + 1);
      });
      
      document.querySelector('.remove-item').addEventListener('click', () => {
        updateCart(PRODUCT_ID, 0);
      });
    }
  
    function updateCart(productId, quantity) {
      const cart = getCart();
      if (quantity <= 0) {
        delete cart[productId];
      } else {
        cart[productId] = quantity;
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCartItems();
      
      // Update cart count in navbar
      const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
      });
    }
  
    // Initialize PayPal
    function setupPayPal() {
      paypal.Buttons({
        createOrder: function(data, actions) {
          const cart = getCart();
          const quantity = cart[PRODUCT_ID] || 0;
          const total = (PRODUCT_PRICE * quantity).toFixed(2);
          
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: total
              }
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
            localStorage.removeItem(CART_KEY);
            renderCartItems();
            document.querySelectorAll('.cart-count').forEach(el => {
              el.textContent = '0';
            });
          });
        }
      }).render('#paypal-button-container');
    }
  
    // Checkout button
    document.querySelector('.checkout-btn')?.addEventListener('click', function(e) {
      e.preventDefault();
      this.style.display = 'none';
      document.getElementById('paypal-button-container').style.display = 'block';
    });
  
    // Initialize page
    if (document.querySelector('.cart-container')) {
      renderCartItems();
      setupPayPal();
      
      // Listen for cart updates from other tabs
      window.addEventListener('storage', function(e) {
        if (e.key === CART_KEY) {
          renderCartItems();
        }
      });
    }
  }
  
  // Initialize the appropriate page
  if (document.querySelector('.product-showcase')) {
    document.addEventListener('DOMContentLoaded', initializeProductPage);
  } else if (document.querySelector('.cart-container')) {
    document.addEventListener('DOMContentLoaded', initializeCartPage);
  }