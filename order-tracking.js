
const ORDER_HISTORY_KEY = "sweetBiteOrders";
const LATEST_ORDER_KEY = "sweetBiteLatestOrder";

const DELIVERY_STATUSES = [
    "Order Received",
    "Preparing",
    "Out for Delivery",
    "Delivered"
];

const STATUS_MESSAGES = {
    "Order Received": {
        heading: "Your order has been received!",
        description: "Thank you! Sweet Bite Bakery has received your order."
    },
    "Preparing": {
        heading: "Your order is being prepared!",
        description: "Our bakery team is preparing your delicious treats."
    },
    "Out for Delivery": {
        heading: "Your order is on its way!",
        description: "Your order is out for delivery."
    },
    "Delivered": {
        heading: "Your order has been delivered!",
        description: "Enjoy your Sweet Bite Bakery treats. Thank you for ordering!"
    }
};

// Get an order number
function getOrderNumber(order) {
    return String(
        order.orderNumber ||
        order.orderId ||
        order.trackingNumber ||
        order.id ||
        ""
    );
}

// Read order history
function getSavedOrders() {
    try {
        const orders = JSON.parse(
            localStorage.getItem(ORDER_HISTORY_KEY)
        );

        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        return [];
    }
}

// Read latest order
function getLatestOrder() {
    try {
        return JSON.parse(
            localStorage.getItem(LATEST_ORDER_KEY)
        );
    } catch (error) {
        return null;
    }
}

// Get all saved orders
function getAllOrders() {
    const orders = getSavedOrders();
    const latestOrder = getLatestOrder();

    if (latestOrder) {
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

// Find order using order number
function findOrder(orderNumber) {
    const searchNumber = String(orderNumber).trim().toLowerCase();

    return getAllOrders().find(order =>
        getOrderNumber(order).toLowerCase() === searchNumber
    );
}

// Make older demo statuses compatible
function normalizeStatus(status) {
    const value = String(status || "").toLowerCase();

    if (value.includes("delivered")) {
        return "Delivered";
    }

    if (value.includes("out for delivery")) {
        return "Out for Delivery";
    }

    if (value.includes("preparing")) {
        return "Preparing";
    }

    return "Order Received";
}

// Format price
function formatCurrency(amount) {
    return "LKR " + Number(amount || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Save updated order
function saveOrder(updatedOrder) {
    const orders = getSavedOrders();
    const orderNumber = getOrderNumber(updatedOrder);

    const index = orders.findIndex(
        order => getOrderNumber(order) === orderNumber
    );

    if (index >= 0) {
        orders[index] = updatedOrder;
    } else {
        orders.push(updatedOrder);
    }

    localStorage.setItem(
        ORDER_HISTORY_KEY,
        JSON.stringify(orders)
    );

    const latestOrder = getLatestOrder();

    if (
        latestOrder &&
        getOrderNumber(latestOrder) === orderNumber
    ) {
        localStorage.setItem(
            LATEST_ORDER_KEY,
            JSON.stringify(updatedOrder)
        );
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById("tracking-empty");
    const resultElement = document.getElementById("tracking-result");

    if (resultElement) {
        resultElement.hidden = true;
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.hidden = false;
    }
}

// Hide error message
function hideError() {
    const errorElement = document.getElementById("tracking-empty");

    if (errorElement) {
        errorElement.hidden = true;
    }
}

// Display order tracking
function displayOrder(order) {
    const resultElement = document.getElementById("tracking-result");

    if (!resultElement) {
        showError("Tracking section could not be found in the HTML.");
        return;
    }

    const status = normalizeStatus(order.status);
    order.status = status;

    const statusIndex = DELIVERY_STATUSES.indexOf(status);

    // Match the IDs in your order-tracking.html
    document.getElementById("display-order-number").textContent =
        getOrderNumber(order);

    document.getElementById("current-status").textContent = status;

    document.getElementById("tracking-customer").textContent =
        order.customerName || "Not available";

    document.getElementById("tracking-total").textContent =
        formatCurrency(order.total);

    document.getElementById("tracking-payment").textContent =
        order.paymentMethod || "Not specified";

    // Status message
    document.getElementById("status-heading").textContent =
        STATUS_MESSAGES[status].heading;

    document.getElementById("status-description").textContent =
        STATUS_MESSAGES[status].description;

    // Update progress line
    const progressFill = document.getElementById("progress-line-fill");

    if (progressFill) {
        progressFill.style.width =
            (statusIndex / (DELIVERY_STATUSES.length - 1) * 100) + "%";
    }

    // Update the four existing tracking steps
    const steps = document.querySelectorAll(
        ".tracking-progress .tracking-step"
    );

    steps.forEach((step, index) => {
        step.classList.remove("completed", "active");

        if (index < statusIndex) {
            step.classList.add("completed");
        } else if (index === statusIndex) {
            step.classList.add("active");
        }

        const circle = step.querySelector(".step-circle");

        if (circle) {
            circle.textContent = index < statusIndex ? "✓" : index + 1;
        }
    });

    // Update demo status button
    const nextButton = document.getElementById("next-status-btn");

    if (nextButton) {
        nextButton.disabled =
            statusIndex >= DELIVERY_STATUSES.length - 1;

        nextButton.textContent =
            nextButton.disabled
                ? "Order Delivered"
                : "Move to Next Status";

        // Prevent multiple click handlers
        nextButton.onclick = function () {
            const currentIndex = DELIVERY_STATUSES.indexOf(order.status);

            if (currentIndex >= DELIVERY_STATUSES.length - 1) {
                return;
            }

            order.status = DELIVERY_STATUSES[currentIndex + 1];

            try {
                saveOrder(order);
                displayOrder(order);
            } catch (error) {
                showError(
                    "Could not save the updated status. Please check browser storage."
                );
            }
        };
    }

    hideError();
    resultElement.hidden = false;

    // Keep normalized status in saved order history
    try {
        saveOrder(order);
    } catch (error) {
        console.error("Unable to save order status:", error);
    }
}

// Track order when button is clicked
function trackOrder() {
    const input = document.getElementById("tracking-number");

    if (!input) {
        showError("Order number input field could not be found.");
        return;
    }

    const orderNumber = input.value.trim();

    if (!orderNumber) {
        showError("Please enter your order number.");
        input.focus();
        return;
    }

    const order = findOrder(orderNumber);

    if (!order) {
        showError(
            "Order not found. Please check your order number and try again."
        );
        return;
    }

    displayOrder(order);
}

// Connect the Track Order button
const trackButton = document.getElementById("track-order-btn");

if (trackButton) {
    trackButton.addEventListener("click", trackOrder);
}

// Allow Enter key to track an order
const trackingInput = document.getElementById("tracking-number");

if (trackingInput) {
    trackingInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            trackOrder();
        }
    });
}

// Track directly when opening from My Orders
const urlParams = new URLSearchParams(window.location.search);
const orderFromURL = urlParams.get("order");

if (orderFromURL && trackingInput) {
    trackingInput.value = orderFromURL;
    trackOrder();
} else {
    // Prefill the most recent order number
    const latestOrder = getLatestOrder();

    if (latestOrder && trackingInput) {
        trackingInput.value = getOrderNumber(latestOrder);
    }
}

// Display current year
const yearElement = document.getElementById("current-year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
