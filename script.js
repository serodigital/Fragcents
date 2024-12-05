let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

async function saveCartToServer() {
    const userId = 'some-user-id'; // Replace with actual user ID or dynamic value

    try {
        const response = await fetch('http://localhost:3002/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                cart: cart,
            }),
        });

        if (response.ok) {
            console.log('Cart saved to server successfully');
        } else {
            const errorText = await response.text();
            console.error('Failed to save cart to server:', errorText);
        }
    } catch (error) {
        console.error('Error in saving cart to server:', error.message);
    }
}

function addToCart(item) {
    // Ensure the price is a number (strip the currency symbol and convert to a float)
    const price = parseFloat(item.price.replace('R', '').trim());
    
    // Create productId from the productName (you might want a more unique ID in a real application)
    const productId = item.productName.replace(/\s+/g, '-').toLowerCase();

    // Check if the item already exists in the cart
    const existingItem = cart.find(cartItem => cartItem.productName === item.productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1, price: price, productId: productId });
    }
    
    // Save the updated cart to localStorage and update the cart count
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Optionally, save the updated cart to the server
    saveCartToServer();
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const productBox = button.closest('.box');
        const item = {
            productName: productBox.querySelector('h3').innerText,
            price: productBox.querySelector('.price').innerText, // This is a string like "R100.00"
        };
        addToCart(item);
        alert(`${item.productName} has been added to your cart!`);
    });
});

updateCartCount();
