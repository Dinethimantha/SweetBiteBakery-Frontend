
document.addEventListener("DOMContentLoaded", function () {
    // Update footer year
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Mobile menu
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("change", function () {
            navLinks.classList.toggle("show", menuToggle.checked);
        });
    }

    // Review elements
    const reviewForm = document.getElementById("review-form");
    const reviewName = document.getElementById("review-name");
    const reviewProduct = document.getElementById("review-product");
    const reviewFeedback = document.getElementById("review-feedback");
    const reviewMessage = document.getElementById("review-message");
    const submittedReviews = document.getElementById("submitted-reviews");

    // Local storage key
    const REVIEW_KEY = "sweetBiteReviews";

    // Read saved reviews
    function getReviews() {
        try {
            const savedReviews = JSON.parse(
                localStorage.getItem(REVIEW_KEY) || "[]"
            );

            return Array.isArray(savedReviews) ? savedReviews : [];
        } catch (error) {
            return [];
        }
    }

    // Display reviews as website-style rows
    function displayReviews() {
        if (!submittedReviews) return;

        const reviews = getReviews();
        submittedReviews.replaceChildren();

        if (reviews.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "submitted-reviews-empty";
            emptyMessage.textContent = "No reviews submitted yet.";
            submittedReviews.appendChild(emptyMessage);
            return;
        }

        reviews.slice().reverse().forEach(function (review) {
            const reviewRow = document.createElement("article");
            reviewRow.className = "testimonial-card";

            // Left side: customer information
            const customerInfo = document.createElement("div");
            customerInfo.className = "testimonial-person";

            const avatar = document.createElement("div");
            avatar.className = "review-avatar";
            avatar.textContent = (review.name || "C")
                .trim()
                .charAt(0)
                .toUpperCase();

            const customerDetails = document.createElement("div");
            customerDetails.className = "review-customer-details";

            const customerName = document.createElement("h3");
            customerName.textContent = review.name || "Customer";

            const productName = document.createElement("span");
            productName.textContent = review.product || "Bakery Product";

            customerDetails.append(customerName, productName);
            customerInfo.append(avatar, customerDetails);

            // Right side: rating and review text
            const reviewContent = document.createElement("div");
            reviewContent.className = "review-content";

            const reviewTopline = document.createElement("div");
            reviewTopline.className = "review-topline";

            const stars = document.createElement("span");
            stars.className = "review-stars";

            const rating = Math.max(
                1,
                Math.min(5, Number(review.rating) || 5)
            );

            stars.textContent =
                "★".repeat(rating) + "☆".repeat(5 - rating);

            const reviewDate = document.createElement("span");
            reviewDate.className = "review-date";

            if (review.date) {
                reviewDate.textContent = review.date;
            }

            reviewTopline.append(stars, reviewDate);

            const feedback = document.createElement("p");
            feedback.textContent = review.feedback || "";

            reviewContent.append(reviewTopline, feedback);
            reviewRow.append(customerInfo, reviewContent);
            submittedReviews.appendChild(reviewRow);
        });
    }

    // Show a message under the review form
    function showMessage(message, isSuccess) {
        if (!reviewMessage) return;

        reviewMessage.textContent = message;
        reviewMessage.style.color = isSuccess ? "#204B47" : "#b42318";
        reviewMessage.style.marginTop = "12px";
    }

    // Submit a review
    if (reviewForm) {
        reviewForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = reviewName.value.trim();
            const product = reviewProduct.value;
            const feedback = reviewFeedback.value.trim();

            const selectedRating = document.querySelector(
                'input[name="rating"]:checked'
            );

            if (!name || !product || !feedback || !selectedRating) {
                showMessage(
                    "Please complete all fields and select a star rating.",
                    false
                );
                return;
            }

            const newReview = {
                name: name,
                product: product,
                rating: Number(selectedRating.value),
                feedback: feedback,
                date: new Date().toLocaleDateString()
            };

            const reviews = getReviews();
            reviews.push(newReview);

            try {
                localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
            } catch (error) {
                showMessage(
                    "Could not save your review. Please check your browser storage.",
                    false
                );
                return;
            }

            displayReviews();
            reviewForm.reset();

            showMessage("Thank you! Your review has been submitted.", true);

            if (submittedReviews) {
                submittedReviews.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    // Display previously submitted reviews on page load
    displayReviews();
});
