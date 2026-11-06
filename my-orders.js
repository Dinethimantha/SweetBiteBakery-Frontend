
"use strict";

// Sweet Bite Bakery - My Orders

const ORDER_HISTORY_KEY = "sweetBiteOrders";
const LATEST_ORDER_KEY = "sweetBiteLatestOrder";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatCurrency(amount) {
    return "LKR " + Number(amount || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getOrderNumber(order) {
    return String(
        order.orderNumber ||
        order.orderId ||
        order.trackingNumber ||
        order.id ||
        "SB-DEMO-001"
    );
}

function getSavedOrders() {
    try {
        const orders = JSON.parse(
            localStorage.getItem(ORDER_HISTORY_KEY) || "[]"
        );

        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

function getLatestOrder() {
    try {
        return JSON.parse(localStorage.getItem(LATEST_ORDER_KEY));
    } catch (error) {
        return null;
    }
}

function getAllOrders() {
    const orders = getSavedOrders();
    const latestOrder = getLatestOrder();

    if (latestOrder && typeof latestOrder === "object") {
        const latestNumber = getOrderNumber(latestOrder);

        const exists = orders.some(
            order => getOrderNumber(order) === latestNumber
        );

        if (!exists) {
            orders.push(latestOrder);
        }
    }

    return orders;
}

function formatDate(dateValue) {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateValue);
    }

    return date.toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatusClass(status) {
    const safeStatus = String(status || "").toLowerCase();

    if (safeStatus === "delivered") return "status-delivered";
    if (safeStatus === "out for delivery") return "status-delivery";
    if (safeStatus === "preparing") return "status-preparing";
    if (safeStatus === "cancelled") return "status-cancelled";

    return "status-received";
}

function getPaymentStatusClass(status) {
    const safeStatus = String(status || "").toLowerCase();

    if (safeStatus.includes("paid") || safeStatus.includes("complete")) {
        return "payment-status-paid";
    }

    if (safeStatus.includes("pending") || safeStatus.includes("not specified")) {
        return "payment-status-pending";
    }

    return "";
}

function getItems(order) {
    return Array.isArray(order.items) ? order.items : [];
}

function getTotalQuantity(items) {
    return items.reduce((total, item) => {
        return total + Math.max(0, Number(item.quantity || item.qty || 1));
    }, 0);
}

function renderOrders() {
    const ordersList = document.getElementById("orders-list");
    const noOrders = document.getElementById("no-orders");
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (!ordersList || !noOrders) return;

    const orders = getAllOrders().slice().reverse();

    if (orders.length === 0) {
        ordersList.replaceChildren();
        ordersList.hidden = true;
        noOrders.hidden = false;
        return;
    }

    ordersList.hidden = false;
    noOrders.hidden = true;

    ordersList.innerHTML = orders.map(order => {
        const orderNumber = getOrderNumber(order);
        const status = order.status || "Order Received";
        const items = getItems(order);

        const itemRows = items.map(item => {
            const name = escapeHTML(item.name || item.title || "Bakery Product");
            const quantity = Math.max(1, Number(item.quantity || item.qty || 1));

            return `
                <div class="order-product-row">
                    <span class="order-product-name">${name}</span>
                    <span class="order-product-quantity">× ${quantity}</span>
                </div>
            `;
        }).join("");

        const customerName = escapeHTML(order.customerName || "Not available");
        const paymentMethod = escapeHTML(order.paymentMethod || "Not specified");
        const paymentStatus = order.paymentStatus || "Not specified";

        return `
            <article class="my-order-card">

                <div class="my-order-top">
                    <div class="order-reference">
                        <span class="order-small-label">ORDER NUMBER</span>
                        <h3>#${escapeHTML(orderNumber)}</h3>
                        <p class="order-date">${formatDate(order.orderDate)}</p>
                    </div>

                    <span class="order-status ${getStatusClass(status)}">
                        ${escapeHTML(status)}
                    </span>
                </div>

                <div class="order-card-divider"></div>

                <div class="order-information-grid">

                    <div class="order-information-block">
                        <span class="order-small-label">CUSTOMER</span>
                        <p>${customerName}</p>
                    </div>

                    <div class="order-information-block">
                        <span class="order-small-label">PAYMENT METHOD</span>
                        <p>${paymentMethod}</p>
                    </div>

                    <div class="order-information-block">
                        <span class="order-small-label">PAYMENT STATUS</span>
                        <p>
                            <span class="payment-status ${getPaymentStatusClass(paymentStatus)}">
                                ${escapeHTML(paymentStatus)}
                            </span>
                        </p>
                    </div>

                    <div class="order-information-block">
                        <span class="order-small-label">TOTAL ITEMS</span>
                        <p>${getTotalQuantity(items)} item(s)</p>
                    </div>

                </div>

                <div class="order-products-section">
                    <h4>Order Summary</h4>
                    <div class="order-products-list">
                        ${itemRows || '<p class="order-no-products">Product details unavailable.</p>'}
                    </div>
                </div>

                <div class="order-card-divider"></div>

                <div class="order-card-bottom">
                    <div class="order-total">
                        <span class="order-small-label">TOTAL AMOUNT</span>
                        <strong>${formatCurrency(order.total)}</strong>
                    </div>

                    <a
                        class="track-order-button"
                        href="order-tracking.html?order=${encodeURIComponent(orderNumber)}"
                    >
                        Track Order <span aria-hidden="true">→</span>
                    </a>
                </div>

            </article>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", renderOrders);
