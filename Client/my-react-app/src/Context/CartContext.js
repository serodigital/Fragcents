import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();// Cart Cotext

// Define the CartProvider component to wrap around any part of the app that needs cart access
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    
    useEffect(() => {// load cart from localStorage if available[1+]
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => { // update localStorage

        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Add a product to the cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if product already exists in cart
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
               
                return prevCart.map((item) => //if True=increment 
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 } //i++ quantity
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }]; // If not, add 

            }
        });
    };
    const removeFromCart = (productId) => {// Remove an item from the cart by its ID
        setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    };

    const updateCart = (productId, quantity) => {   // Update the quantity 
        setCart((prevCart) =>
            prevCart.map((item) =>
                item._id === productId ? { ...item, quantity } : item 
            )
        );
    };

    const clearCart = () => setCart([]);// Clear entire cart


    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
