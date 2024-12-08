<script>
// Sample data for perfumes (You can replace this with dynamic data if needed)
const perfumes = [
    { name: "Lavender Bliss", category: "Floral", price: "$25", img: "1.jpg" },
    { name: "Ocean Breeze", category: "Fresh", price: "$30", img: "2.jpg" },
    { name: "Citrus Delight", category: "Citrus", price: "$22", img: "3.jpg" },
    { name: "Musk Mystery", category: "Woody", price: "$28", img: "4.jpg" },
    { name: "Rose Garden", category: "Floral", price: "$35", img: "5.jpg" },
    { name: "Vanilla Dream", category: "Sweet", price: "$26", img: "6.jpg" },
    { name: "Spicy Sandal", category: "Woody", price: "$29", img: "7.jpg" },
    { name: "Lemon Fresh", category: "Citrus", price: "$23", img: "8.jpg" },
    { name: "Jasmine Bloom", category: "Floral", price: "$32", img: "9.jpg" },
    { name: "Amber Essence", category: "Oriental", price: "$40", img: "10.jpg" },
];

// Function to load perfumes on page load
function loadPerfumes() {
    const productContainer = document.querySelector('.product .box-container');
    productContainer.innerHTML = ''; // Clear any existing products

    perfumes.forEach(perfume => {
        const productBox = document.createElement('div');
        productBox.classList.add('box');
        productBox.innerHTML = `
            <img src="${perfume.img}" alt="${perfume.name}">
            <h3>${perfume.name}</h3>
            <div class="price">${perfume.price}</div>
            <button class="btn" onclick="addToCart('${perfume.name}')">Add to Cart</button>
        `;
        productContainer.appendChild(productBox);
    });
}

// Function to add item to cart
function addToCart(perfumeName) {
    alert(`${perfumeName} has been added to your cart!`);
}

// Function to filter products by category
function filterByCategory(category) {
    const filteredPerfumes = category === 'All' ? perfumes : perfumes.filter(perfume => perfume.category === category);
    displayPerfumes(filteredPerfumes);
}

// Function to display perfumes based on filter
function displayPerfumes(perfumesToShow) {
    const productContainer = document.querySelector('.product .box-container');
    productContainer.innerHTML = ''; // Clear previous results

    perfumesToShow.forEach(perfume => {
        const productBox = document.createElement('div');
        productBox.classList.add('box');
        productBox.innerHTML = `
            <img src="${perfume.img}" alt="${perfume.name}">
            <h3>${perfume.name}</h3>
            <div class="price">${perfume.price}</div>
            <button class="btn" onclick="addToCart('${perfume.name}')">Add to Cart</button>
        `;
        productContainer.appendChild(productBox);
    });
}

// Function to search perfumes by name
function searchPerfumes() {
    const query = document.querySelector('.search-box-container input[type="search"]').value.toLowerCase();
    const filteredPerfumes = perfumes.filter(perfume => perfume.name.toLowerCase().includes(query));
    displayPerfumes(filteredPerfumes);
}

// Initialize the page with all perfumes
document.addEventListener('DOMContentLoaded', () => {
    loadPerfumes();

    // Attach event listener for search
    document.querySelector('.search-box-container input[type="search"]').addEventListener('input', searchPerfumes);

    // Event listeners for category filtering
    document.querySelectorAll('.category .box').forEach(box => {
        box.addEventListener('click', () => {
            const category = box.querySelector('h3').textContent;
            filterByCategory(category);
        });
    });
});
</script>
