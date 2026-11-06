
const cartProductData = [
    { id: 1, name: "Chocolate Celebration Cake", price: 4500, image: "images/Chocolate Celebration Cake.jpg" },
    { id: 2, name: "Vanilla Birthday Cake", price: 3800, image: "images/vanilla.jpg" },
    { id: 3, name: "Red Velvet Cake", price: 5200, image: "images/birthday-cake.jpg" },
    { id: 4, name: "Strawberry Birthday Cake", price: 4800, image: "images/strawberry.jpg" },
    { id: 5, name: "Elegant Wedding Cake", price: 18000, image: "images/wedding-cake.jpg" },
    { id: 6, name: "Classic Wedding Cake", price: 15000, image: "images/classic wedding cake.jpg" },
    { id: 7, name: "Floral Wedding Cake", price: 19000, image: "images/floral.jpg" },
    { id: 8, name: "Vanilla Dream Cupcakes", price: 1200, image: "images/vanilla dream cupcakes.jpg" },
    { id: 9, name: "Chocolate Cupcakes", price: 1400, image: "images/chocolate cupCAKES.jpg" },
    { id: 10, name: "Buttercream Cupcakes", price: 1400, image: "images/buttercream.jpg" },
    { id: 11, name: "Butter Croissant", price: 750, image: "images/butter cro.jpg" },
    { id: 12, name: "Chocolate Pastry", price: 450, image: "images/chocolate pastry.jpg" },
    { id: 13, name: "savory pastry", price: 650, image: "images/savory pastry.jpg" },
];

const CART_KEY = "sweetBiteCart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function formatPrice(price) {
    return "LKR " + Number(price).toLocaleString("en-LK");
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce(
        (total, item) => total + Number(item.quantity), 0
    );

    document.querySelectorAll(".cart-count").forEach(element => {
        element.textContent = count;
    });
}

function addToCart(productId) {
    const product = cartProductData.find(item => item.id === productId);

    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);

    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "success",
            title: "Added to Cart!",
            text: product.name + " has been added to your cart.",
            showCancelButton: true,
            confirmButtonText: "View Cart",
            cancelButtonText: "Continue Shopping",
            confirmButtonColor: "#204B47"
        }).then(result => {
            if (result.isConfirmed) {
                window.location.href = "cart.html";
            }
        });
    }
}

function changeQuantity(productId, amount) {
    const cart = getCart();
    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.quantity += amount;

    const updatedCart = cart.filter(product => product.quantity > 0);

    saveCart(updatedCart);
    renderCart();
}

function removeFromCart(productId) {
    const updatedCart = getCart().filter(item => item.id !== productId);
    saveCart(updatedCart);
    renderCart();
}

function renderCart() {
    const cartItemsElement = document.getElementById("cart-items");

    if (!cartItemsElement) return;

    const cart = getCart();
    const summary = document.getElementById("cart-summary");
    const totalElement = document.getElementById("cart-total");

    if (cart.length === 0) {
        cartItemsElement.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>You haven't added any bakery treats yet.</p>
                <a href="products.html" class="btn btn-primary">
                    Explore Products
                </a>
            </div>
        `;

        if (summary) summary.style.display = "none";
        return;
    }

    if (summary) summary.style.display = "block";

    let grandTotal = 0;

    cartItemsElement.innerHTML = cart.map(item => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        grandTotal += itemTotal;

        return `
            <article class="cart-item">
                <img
                    src="${item.image}"
                    alt="${item.name}"
                    onerror="this.onerror=null; this.src='images/hero-cake.jpg'"
                >

                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${formatPrice(item.price)} each</p>

                    <div class="quantity-controls">
                        <button type="button"
                            aria-label="Decrease quantity"
                            onclick="changeQuantity(${item.id}, -1)">−</button>

                        <span>${item.quantity}</span>

                        <button type="button"
                            aria-label="Increase quantity"
                            onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>

                <div class="cart-item-end">
                    <strong>${formatPrice(itemTotal)}</strong>

                    <button type="button" class="remove-btn"
                        onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </div>
            </article>
        `;
    }).join("");

    if (totalElement) {
        totalElement.textContent = formatPrice(grandTotal);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();
    renderCart();

    const clearButton = document.getElementById("clear-cart-btn");

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (getCart().length === 0) return;

            if (typeof Swal === "undefined") {
                if (confirm("Are you sure you want to clear your cart?")) {
                    saveCart([]);
                    renderCart();
                }
                return;
            }

            Swal.fire({
                title: "Clear your cart?",
                text: "All products will be removed from your cart.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, clear it",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#482410"
            }).then(result => {
                if (result.isConfirmed) {
                    saveCart([]);
                    renderCart();

                    Swal.fire({
                        icon: "success",
                        title: "Cart Cleared",
                        text: "Your cart is now empty.",
                        confirmButtonColor: "#204B47"
                    });
                }
            });
        });
    }

    const checkoutButton = document.getElementById("checkout-btn");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            const cart = getCart();

            if (cart.length === 0) {
                if (typeof Swal !== "undefined") {
                    Swal.fire({
                        icon: "warning",
                        title: "Your cart is empty",
                        text: "Please add products before checkout."
                    });
                }
                return;
            }

            window.location.href = "checkout.html";
        });
    }
});
// Update cart count in the navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll("#cart-count");

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("sweetBiteCart")) || [];
    } catch (error) {
        cart = [];
    }

    const totalItems = cart.reduce(function (total, item) {
        return total + (Number(item.quantity) || 1);
    }, 0);

    cartCountElements.forEach(function (element) {
        element.textContent = totalItems;
    });
}

// Update when the page loads
document.addEventListener("DOMContentLoaded", updateCartCount);

// Update when the cart changes in another browser tab
window.addEventListener("storage", function (event) {
    if (event.key === "sweetBiteCart") {
        updateCartCount();
    }
});