import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart reducer to handle all cart operations
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Always add as a new item, never increment existing
      // Create a unique identifier using timestamp + random number
      const uniqueId = `${action.payload._id}_${Date.now()}_${Math.random()}`;
      
      return [
        ...state,
        {
          ...action.payload,
          cartItemId: uniqueId, // Unique identifier for this cart entry
          quantity: 1, // Always start with quantity 1
          // Ensure we have the image URL if _id exists
          image: action.payload._id 
            ? `http://localhost:8000/api/product/image/${action.payload._id}`
            : action.payload.image || "/images/default.jpg"
        }
      ];

    case 'REMOVE_FROM_CART':
      return state.filter(item => item.cartItemId !== action.payload);

    case 'UPDATE_CART':
      return state.map(item =>
        item.cartItemId === action.payload.cartItemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case 'CLEAR_CART':
      return [];

    case 'LOAD_CART':
      return action.payload || [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    console.log('Adding to cart:', product); // Debug log
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (cartItemId) => {
    console.log('Removing from cart:', cartItemId); // Debug log
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
  };

  const updateCart = (cartItemId, quantity) => {
    console.log('Updating cart:', cartItemId, quantity); // Debug log
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      dispatch({ 
        type: 'UPDATE_CART', 
        payload: { cartItemId, quantity } 
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateCart,
      clearCart,
      getCartItemCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};