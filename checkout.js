
"use strict";

// Sweet Bite Bakery - Checkout System

const CHECKOUT_CART_KEY = "sweetBiteCart";
const ORDER_HISTORY_KEY = "sweetBiteOrders";
const LATEST_ORDER_KEY = "sweetBiteLatestOrder";

let cart = [];

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------
    // 1. LOAD CART
    // ------------------------------------

    function loadCart() {
        try {
            const savedCart = JSON.parse(
                localStorage.getItem(CHECKOUT_CART_KEY) || "[]"
            );

            cart = Array.isArray(savedCart) ? savedCart : [];
        } catch (error) {
            cart = [];
        }
    }

    loadCart();

    // ------------------------------------
    // 2. HELPER FUNCTIONS
    // ------------------------------------

    function getPaymentMethod() {
        const selected = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        return selected ? selected.value : "Cash on Delivery";
    }

    function getCartTotal(items) {
        return items.reduce(function (total, item) {
            const price = Math.max(0, Number(item.price) || 0);
            const quantity = Math.max(
                1,
                Number(item.quantity || item.qty || 1)
            );

            return total + price * quantity;
        }, 0);
    }

    function formatCurrency(amount) {
        return "LKR " + Number(amount).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function showAlert(options) {
        if (typeof Swal !== "undefined") {
            return Swal.fire(options);
        }

        alert(
            [options.title, options.text]
                .filter(Boolean)
                .join("\n\n")
        );

        return Promise.resolve({ isConfirmed: true });
    }

    function getSavedOrders() {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem(ORDER_HISTORY_KEY) || "[]"
            );

            return Array.isArray(savedOrders) ? savedOrders : [];
        } catch (error) {
            return [];
        }
    }

    // ------------------------------------
    // 3. DISPLAY ORDER SUMMARY
    // ------------------------------------

    function renderCheckoutItems() {
        const checkoutItems = document.getElementById("checkout-items");
        const checkoutTotal = document.getElementById("checkout-total");
        const bankTransferAmount = document.getElementById(
            "bank-transfer-amount"
        );
        const placeOrderButton = document.getElementById("place-order-btn");

        if (!checkoutItems || !checkoutTotal) return;

        if (cart.length === 0) {
            checkoutItems.innerHTML = `
                <p>Your cart is empty.</p>
                <a href="products.html">Continue shopping</a>
            `;

            checkoutTotal.textContent = formatCurrency(0);

            if (bankTransferAmount) {
                bankTransferAmount.textContent = formatCurrency(0);
            }

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
            }

            return;
        }

        checkoutItems.innerHTML = cart.map(function (item) {
            const name = escapeHTML(
                item.name || item.title || "Bakery Product"
            );

            const price = Math.max(0, Number(item.price) || 0);
            const quantity = Math.max(
                1,
                Number(item.quantity || item.qty || 1)
            );

            return `
                <div class="checkout-item">
                    <div>
                        <strong>${name}</strong>
                        <p>Quantity: ${quantity}</p>
                    </div>
                    <span>${formatCurrency(price * quantity)}</span>
                </div>
            `;
        }).join("");

        const total = getCartTotal(cart);

        checkoutTotal.textContent = formatCurrency(total);

        if (bankTransferAmount) {
            bankTransferAmount.textContent = formatCurrency(total);
        }

        if (placeOrderButton) {
            placeOrderButton.disabled = false;
        }
    }

    // ------------------------------------
    // 4. PAYMENT METHOD PANELS
    // ------------------------------------

    const paymentOptions = document.querySelectorAll(
        'input[name="paymentMethod"]'
    );

    const bankPanel = document.getElementById("bank-transfer-panel");
    const cardPanel = document.getElementById("card-payment-panel");

    function updatePaymentPanel() {
        const method = getPaymentMethod();

        if (bankPanel) {
            bankPanel.hidden = method !== "Bank Transfer";
        }

        if (cardPanel) {
            cardPanel.hidden = method !== "Card Payment (Demo)";
        }

        // Reset bank confirmation when leaving bank transfer
        if (method !== "Bank Transfer") {
            const confirmation = document.getElementById(
                "transfer-confirmation"
            );

            if (confirmation) {
                confirmation.checked = false;
            }
        }
    }

    paymentOptions.forEach(function (option) {
        option.addEventListener("change", updatePaymentPanel);
    });

    // ------------------------------------
    // 5. CARD NUMBER FORMATTING
    // ------------------------------------

    const cardNumberInput = document.getElementById("card-number");

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", function () {
            const digits = this.value
                .replace(/\D/g, "")
                .slice(0, 16);

            this.value = digits.match(/.{1,4}/g)?.join(" ") || "";
        });
    }

    // ------------------------------------
    // 6. CARD EXPIRY FORMATTING
    // ------------------------------------

    const cardExpiryInput = document.getElementById("card-expiry");

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", function () {
            const digits = this.value
                .replace(/\D/g, "")
                .slice(0, 4);

            if (digits.length > 2) {
                this.value = digits.slice(0, 2) + "/" + digits.slice(2);
            } else {
                this.value = digits;
            }
        });
    }

    // ------------------------------------
    // 7. CVV INPUT
    // ------------------------------------

    const cardCVVInput = document.getElementById("card-cvv");

    if (cardCVVInput) {
        cardCVVInput.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    // ------------------------------------
    // 8. COPY BANK ACCOUNT NUMBER
    // ------------------------------------

    const copyAccountButton = document.getElementById("copy-account-btn");

    if (copyAccountButton) {
        copyAccountButton.addEventListener("click", async function () {
            const accountElement = document.getElementById(
                "bank-account-number"
            );

            if (!accountElement) return;

            const accountNumber = accountElement.textContent.trim();

            try {
                await navigator.clipboard.writeText(accountNumber);

                showAlert({
                    icon: "success",
                    title: "Copied!",
                    text: "Bank account number copied.",
                    confirmButtonColor: "#204B47"
                });
            } catch (error) {
                // Fallback for browsers that block clipboard access
                const temporaryInput = document.createElement("textarea");

                temporaryInput.value = accountNumber;
                temporaryInput.style.position = "fixed";
                temporaryInput.style.opacity = "0";

                document.body.appendChild(temporaryInput);
                temporaryInput.select();

                const copied = document.execCommand("copy");
                temporaryInput.remove();

                showAlert({
                    icon: copied ? "success" : "info",
                    title: copied ? "Copied!" : "Bank Account Number",
                    text: copied
                        ? "Bank account number copied."
                        : accountNumber,
                    confirmButtonColor: "#204B47"
                });
            }
        });
    }

    // ------------------------------------
    // 9. CUSTOMER DETAILS
    // ------------------------------------

    const checkoutForm = document.getElementById("checkout-form");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Read the latest cart
            loadCart();

            if (cart.length === 0) {
                showAlert({
                    icon: "warning",
                    title: "Your cart is empty",
                    text: "Please add products before placing an order.",
                    confirmButtonColor: "#204B47"
                });

                renderCheckoutItems();
                return;
            }

            const customerName = document
                .getElementById("customer-name")
                .value.trim();

            const customerPhone = document
                .getElementById("customer-phone")
                .value.trim();

            const customerEmail = document
                .getElementById("customer-email")
                .value.trim();

            const customerAddress = document
                .getElementById("customer-address")
                .value.trim();

            // Email is optional
            if (!customerName || !customerPhone || !customerAddress) {
                showAlert({
                    icon: "warning",
                    title: "Missing details",
                    text: "Please complete your name, phone number and delivery address.",
                    confirmButtonColor: "#204B47"
                });

                return;
            }

            if (!/^0\d{9}$/.test(customerPhone)) {
                showAlert({
                    icon: "warning",
                    title: "Invalid phone number",
                    text: "Enter a valid 10-digit Sri Lankan phone number.",
                    confirmButtonColor: "#204B47"
                });

                return;
            }

            const paymentMethod = getPaymentMethod();
            let paymentReference = "";

            // ------------------------------------
            // 10. BANK TRANSFER VALIDATION
            // ------------------------------------

            if (paymentMethod === "Bank Transfer") {
                paymentReference = document
                    .getElementById("payment-reference")
                    .value.trim();

                const transferConfirmation = document.getElementById(
                    "transfer-confirmation"
                );

                if (!transferConfirmation || !transferConfirmation.checked) {
                    showAlert({
                        icon: "warning",
                        title: "Confirm bank transfer",
                        text: "Please confirm that you understand the bank transfer process.",
                        confirmButtonColor: "#204B47"
                    });

                    return;
                }

                // Reference is optional, matching the HTML label.
                // A reference does not prove that payment was received.
            }

            // ------------------------------------
            // 11. CARD PAYMENT DEMO VALIDATION
            // ------------------------------------

            if (paymentMethod === "Card Payment (Demo)") {
                const cardholderName = document
                    .getElementById("cardholder-name")
                    .value.trim();

                const cardNumber = document
                    .getElementById("card-number")
                    .value.replace(/\D/g, "");

                const cardExpiry = document
                    .getElementById("card-expiry")
                    .value.trim();

                const cardCVV = document
                    .getElementById("card-cvv")
                    .value.trim();

                if (
                    !cardholderName ||
                    !/^\d{16}$/.test(cardNumber) ||
                    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) ||
                    !/^\d{3,4}$/.test(cardCVV)
                ) {
                    showAlert({
                        icon: "warning",
                        title: "Check your card details",
                        text: "For this demo, enter a cardholder name, 16-digit number, expiry in MM/YY format and a 3–4 digit CVV.",
                        confirmButtonColor: "#204B47"
                    });

                    return;
                }

                // IMPORTANT:
                // This is only a demo form.
                // No payment is processed.
                // Never save card number, expiry or CVV.
            }

            // ------------------------------------
            // 12. CREATE ORDER
            // ------------------------------------

            const total = getCartTotal(cart);
            const orderId = "SB" + Date.now();

            const order = {
                orderId: orderId,
                orderNumber: orderId,

                customerName: customerName,
                customerPhone: customerPhone,
                customerEmail: customerEmail,
                customerAddress: customerAddress,

                paymentMethod: paymentMethod,
                paymentReference: paymentReference,

                items: cart,
                total: total,

                orderDate: new Date().toISOString(),

                status: "Order Received",

                paymentStatus:
                    paymentMethod === "Bank Transfer"
                        ? "Pending Verification"
                        : paymentMethod === "Card Payment (Demo)"
                            ? "Demo - Not Processed"
                            : "Cash on Delivery"
            };

            // ------------------------------------
            // 13. SAVE ORDER
            // ------------------------------------

            try {
                const orders = getSavedOrders();

                orders.push(order);

                localStorage.setItem(
                    ORDER_HISTORY_KEY,
                    JSON.stringify(orders)
                );

                localStorage.setItem(
                    LATEST_ORDER_KEY,
                    JSON.stringify(order)
                );

                localStorage.removeItem(CHECKOUT_CART_KEY);
            } catch (error) {
                showAlert({
                    icon: "error",
                    title: "Unable to save order",
                    text: "Browser storage is unavailable or full. Please try again.",
                    confirmButtonColor: "#204B47"
                });

                return;
            }

            // ------------------------------------
            // 14. ORDER SUCCESS MESSAGE
            // ------------------------------------

            const result = await showAlert({
                icon: "success",
                title: "Order placed!",
                html: `
                    <p>Your order has been saved successfully.</p>
                    <p><strong>Order Number:</strong> ${escapeHTML(orderId)}</p>
                    <p><strong>Total:</strong> ${formatCurrency(total)}</p>
                    <p><strong>Payment:</strong> ${escapeHTML(paymentMethod)}</p>
                    <small>
                        Demo website only. No online card payment has been processed.
                    </small>
                `,
                confirmButtonText: "View Order",
                confirmButtonColor: "#204B47",
                allowOutsideClick: false
            });

            if (result && result.isConfirmed) {
                window.location.href = "order-confirmation.html";
            }
        });
    }

    // ------------------------------------
    // 15. FOOTER YEAR
    // ------------------------------------

    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ------------------------------------
    // 16. INITIAL SETUP
    // ------------------------------------

    renderCheckoutItems();
    updatePaymentPanel();
});
