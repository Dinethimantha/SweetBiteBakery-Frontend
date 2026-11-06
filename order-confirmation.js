
const LATEST_ORDER_KEY = "sweetBiteLatestOrder";

function formatPrice(price) {
    return "LKR " + Number(price).toLocaleString("en-LK");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

function loadLatestOrder() {
    try {
        const savedOrder = localStorage.getItem(LATEST_ORDER_KEY);
        return savedOrder ? JSON.parse(savedOrder) : null;
    } catch (error) {
        return null;
    }
}

function renderConfirmation() {
    document.getElementById("current-year").textContent =
        new Date().getFullYear();

    const order = loadLatestOrder();

    const content = document.getElementById("confirmation-content");
    const orderNumber = document.getElementById(
        "confirmation-order-number"
    );

    if (
        !order ||
        !order.orderId ||
        !Array.isArray(order.items)
    ) {
        orderNumber.textContent = "Order details unavailable";

        content.innerHTML = `
            <section class="checkout-card">
                <h2>No Order Found</h2>
                <p>
                    We could not find a recent order in this browser.
                    Please place an order before viewing its confirmation.
                </p>
                <a href="products.html" class="btn btn-primary">
                    Browse Products
                </a>
            </section>
        `;

        return;
    }

    orderNumber.textContent = "Order Number: " + order.orderId;

    const itemsHTML = order.items.map(item => {
        const name = escapeHTML(item.name);
        const quantity = Number(item.quantity);
        const price = Number(item.price);
        const itemTotal = quantity * price;

        return `
            <div class="confirmation-product">
                <div>
                    <h3>${name}</h3>
                    <p>Quantity: ${quantity}</p>
                    <p>Unit Price: ${formatPrice(price)}</p>
                </div>

                <strong>${formatPrice(itemTotal)}</strong>
            </div>
        `;
    }).join("");

    let paymentMessage = "";

    if (order.paymentMethod === "Bank Transfer") {
        paymentMessage = `
            <p class="payment-note">
                Payment Pending - Demo. The bank transfer has not
                been verified.
            </p>
        `;
    } else if (order.paymentMethod === "Card Payment (Demo)") {
        paymentMessage = `
            <p class="payment-note">
                Demo payment only. No card payment was processed
                and no money was charged.
            </p>
        `;
    } else {
        paymentMessage = `
            <p class="payment-note">
                Please pay when your order arrives.
            </p>
        `;
    }

    content.innerHTML = `
        <div class="confirmation-grid">

            <section class="checkout-card">
                <h2>Order Details</h2>

                <div class="confirmation-detail">
                    <span>Order Number</span>
                    <strong>${escapeHTML(order.orderId)}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Order Date</span>
                    <strong>${escapeHTML(order.orderDate)}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Payment Method</span>
                    <strong>${escapeHTML(order.paymentMethod)}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Order Status</span>
                    <strong>${escapeHTML(order.status)}</strong>
                </div>

                ${paymentMessage}
            </section>

            <section class="checkout-card">
                <h2>Customer Details</h2>

                <div class="confirmation-detail">
                    <span>Full Name</span>
                    <strong>${escapeHTML(order.customerName)}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Phone Number</span>
                    <strong>${escapeHTML(order.customerPhone)}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Email Address</span>
                    <strong>${escapeHTML(order.customerEmail || "Not provided")}</strong>
                </div>

                <div class="confirmation-detail">
                    <span>Delivery Address</span>
                    <strong>${escapeHTML(order.customerAddress)}</strong>
                </div>
            </section>

        </div>

        <section class="checkout-card confirmation-items-card">
            <h2>Items Ordered</h2>

            ${itemsHTML}

            <div class="checkout-total-row">
                <span>Total Amount</span>
                <strong>${formatPrice(order.total)}</strong>
            </div>
        </section>

        <p class="confirmation-disclaimer">
            This website uses a browser-based demo order system.
            The bakery has not been notified automatically.
        </p>
    `;
}

document.addEventListener("DOMContentLoaded", renderConfirmation);
