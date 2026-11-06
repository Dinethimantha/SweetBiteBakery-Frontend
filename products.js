
const bakeryProducts = [
    {
        id: 1,
        name: "Chocolate Celebration Cake",
        price: 4500,
        category: "birthday",
        image: "images/Chocolate Celebration Cake.jpg",
        description: "A rich chocolate cake for your special day."
    },
    {
        id: 2,
        name: "Vanilla Birthday Cake",
        price: 3800,
        category: "birthday",
        image: "images/vanilla.jpg",
        description: "Soft vanilla sponge with creamy frosting."
    },
    {
        id: 3,
        name: "Red Velvet Cake",
        price: 5200,
        category: "birthday",
        image: "images/red velvet.jpg",
        description: "A delicious red velvet cake with cream cheese frosting."
    },
    {
        id: 4,
        name: "Strawberry Birthday Cake",
        price: 4800,
        category: "birthday",
        image: "images/strawberry.jpg",
        description: "A fruity cake with a sweet strawberry flavour."
    },
    {
        id: 5,
        name: "Elegant Wedding Cake",
        price: 18000,
        category: "wedding",
        image: "images/wedding-cake.jpg",
        description: "An elegant cake for your unforgettable celebration."
    },
    {
        id: 6,
        name: "Classic Wedding Cake",
        price: 15000,
        category: "wedding",
        image: "images/classic wedding cake.jpg",
        description: "A timeless design for your special wedding day."
    },
     {
        id: 7,
        name: "Floral Wedding Cake",
        price: 19000,
        category: "wedding",
        image: "images/floral.jpg",
        description: "A beautiful three-tier wedding cake decorated with delicate white roses, soft ivory buttercream, and elegant golden details. Perfect for a romantic and luxurious wedding celebration."
    },
    {
        id: 8,
        name: "Vanilla Dream Cupcakes",
        price: 1200,
        category: "cupcakes",
        image: "images/vanilla dream cupcakes.jpg",
        description: "Soft vanilla cupcakes with creamy toppings."
    },
    {
        id: 9,
        name: "Chocolate Cupcakes",
        price: 1400,
        category: "cupcakes",
        image: "images/chocolate cupCAKES.jpg",
        description: "Soft vanilla cupcakes topped with creamy buttercream frosting and colorful sprinkles, perfect for birthdays, parties, and special celebrations.."
    },
     {
        id: 10,
        name: "Buttercream Cupcakes",
        price: 1400,
        category: "cupcakes",
        image: "images/buttercream.jpg",
        description: "Chocolate cupcakes perfect for sharing."
    },
    {
        id: 11,
        name: "Butter Croissant",
        price: 750,
        category: "pastries",
        image: "images/butter cro.jpg",
        description: "A golden, flaky pastry for your morning treat."
    },
    {
        id: 12,
        name: "Chocolate Pastry",
        price: 450,
        category: "pastries",
        image: "images/chocolate pastry.jpg",
        description: "A soft pastry filled with delicious chocolate."
    },
    {
        id: 13,
        name: "savory pastry",
        price: 650,
        category: "pastries",
        image: "images/savory pastry.jpg",
        description: "Freshly baked savory pastries filled with delicious ingredients, offering a crispy golden crust and a flavorful bite.."
    }

];

const productList = document.getElementById("product-list");
const filterButtons = document.querySelectorAll(".filter-btn");

function displayProducts(category = "all") {
    if (!productList) return;

    const filteredProducts = category === "all"
        ? bakeryProducts
        : bakeryProducts.filter(product => product.category === category);

    productList.innerHTML = "";

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}"
                 onerror="this.src='images/hero-cake.jpg'">
            <div class="product-card-content">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-card-bottom">
                    <strong>LKR ${product.price.toLocaleString("en-LK")}</strong>
                    <button class="btn btn-primary"
                            onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        productList.appendChild(card);
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        displayProducts(button.dataset.category);
    });
});

displayProducts();
