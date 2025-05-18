document.addEventListener('DOMContentLoaded', function() {
    const CART_KEY = 'projector_cart_sync';
    const PRODUCT_ID = 'hy300-pro-plus';
    const PRODUCT_PRICE = 1;

    // Get cart from localStorage
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || {};
        } catch (e) {
            console.error("Cart read error:", e);
            return {};
        }
    }

    // Update cart in localStorage
    function updateCart(productId, quantity) {
        const cart = getCart();
        if (quantity <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = quantity;
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }

    // Render cart items
    function renderCartItems() {
        const cart = getCart();
        const cartItemsContainer = document.querySelector('.cart-items');
        const checkoutBtn = document.querySelector('.checkout-btn');
        const paymentContainer = document.querySelector('.payment-center-container');
        const emptyCartMsg = document.querySelector('.empty-cart-message');

        if (!cart[PRODUCT_ID] || cart[PRODUCT_ID] <= 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is empty</p>
                    <a href="index.html" class="continue-shopping-btn">Continue Shopping</a>
                </div>
            `;
            checkoutBtn.style.display = 'none';
            paymentContainer.style.display = 'none';
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

        // Update summary
        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.total-price').textContent = `$${subtotal.toFixed(2)}`;

        // Show checkout button
        checkoutBtn.style.display = 'block';
        paymentContainer.style.display = 'none';

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

    // Update cart count in navbar
    function updateCartCount() {
        const cart = getCart();
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }

    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === CART_KEY) {
            renderCartItems();
            updateCartCount();
        }
    });

    // Initialize cart page
    renderCartItems();
    updateCartCount();
});