import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

const CartContext = createContext();

// ==========================================
// CART REDUCER
// ==========================================
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const product = action.payload;

      // Make sure we always have the real product ID
      const productId = product._id || product.id;

      if (!productId) {
        console.error("Cannot add product without an ID:", product);
        return state;
      }

      // Find existing product using PRODUCT ID
      // NOT cartItemId
      const existingItem = state.find(
        (item) => String(item._id || item.id) === String(productId)
      );

      // ==========================================
      // PRODUCT ALREADY EXISTS
      // ==========================================
      if (existingItem) {
        const currentQuantity = Number(existingItem.quantity) || 1;

        // Database stock
        const availableStock =
          Number(product.stock ?? product.quantity) ||
          Number(existingItem.stock ?? existingItem.availableStock) ||
          0;

        console.log("=================================");
        console.log("ADDING EXISTING PRODUCT");
        console.log("Product:", product.name);
        console.log("Product ID:", productId);
        console.log("Current cart quantity:", currentQuantity);
        console.log("Available stock:", availableStock);
        console.log("=================================");

        // Stop if stock is unavailable
        if (availableStock <= 0) {
          return state;
        }

        // Do not allow quantity above database stock
        if (currentQuantity >= availableStock) {
          return state;
        }

        // Increment ONLY the matching product
        return state.map((item) => {
          const itemId = item._id || item.id;

          if (String(itemId) === String(productId)) {
            return {
              ...item,
              quantity: currentQuantity + 1,

              // Keep latest stock value
              stock: availableStock,
            };
          }

          return item;
        });
      }

      // ==========================================
      // NEW PRODUCT
      // ==========================================

      const availableStock =
        Number(product.stock ?? product.quantity) || 0;

      // Don't add products with no stock
      if (availableStock <= 0) {
        console.log("Product is out of stock:", product.name);
        return state;
      }

      const newCartItem = {
        ...product,

        // Always use _id
        _id: productId,

        // One item initially
        quantity: 1,

        // Keep database stock
        stock: availableStock,

        // Unique ID for THIS cart line
        cartItemId: `${productId}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`,

        // Use product image if supplied
        image:
          product.image ||
          `http://localhost:8000/api/product/image/${productId}`,
      };

      console.log("=================================");
      console.log("ADDING NEW PRODUCT");
      console.log("Product:", newCartItem.name);
      console.log("Product ID:", newCartItem._id);
      console.log("Stock:", newCartItem.stock);
      console.log("=================================");

      return [...state, newCartItem];
    }

    // ==========================================
    // REMOVE ITEM
    // ==========================================
    case "REMOVE_FROM_CART":
      return state.filter(
        (item) => item.cartItemId !== action.payload
      );

    // ==========================================
    // UPDATE QUANTITY
    // ==========================================
    case "UPDATE_CART":
      return state.map((item) =>
        item.cartItemId === action.payload.cartItemId
          ? {
              ...item,
              quantity: action.payload.quantity,
            }
          : item
      );

    // ==========================================
    // CLEAR CART
    // ==========================================
    case "CLEAR_CART":
      return [];

    // ==========================================
    // LOAD CART
    // ==========================================
    case "LOAD_CART":
      return action.payload || [];

    default:
      return state;
  }
};

// ==========================================
// CART PROVIDER
// ==========================================
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);

  // ==========================================
  // LOAD CART FROM LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          dispatch({
            type: "LOAD_CART",
            payload: parsedCart,
          });
        }
      } catch (error) {
        console.error(
          "Error loading cart from localStorage:",
          error
        );

        localStorage.removeItem("cart");
      }
    }
  }, []);

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = (product) => {
    console.log("Adding to cart:", product);

    dispatch({
      type: "ADD_TO_CART",
      payload: product,
    });
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const removeFromCart = (cartItemId) => {
    console.log("Removing from cart:", cartItemId);

    dispatch({
      type: "REMOVE_FROM_CART",
      payload: cartItemId,
    });
  };

  // ==========================================
  // UPDATE CART
  // ==========================================
  const updateCart = (cartItemId, quantity) => {
    console.log(
      "Updating cart:",
      cartItemId,
      quantity
    );

    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    dispatch({
      type: "UPDATE_CART",
      payload: {
        cartItemId,
        quantity,
      },
    });
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    dispatch({
      type: "CLEAR_CART",
    });
  };

  // ==========================================
  // TOTAL CART ITEMS
  // ==========================================
  const getCartItemCount = () => {
    return cart.reduce(
      (total, item) =>
        total + (Number(item.quantity) || 1),
      0
    );
  };

  // ==========================================
  // CART TOTAL
  // ==========================================
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price =
        typeof item.price === "number"
          ? item.price
          : parseFloat(
              String(item.price).replace(/[^\d.-]/g, "")
            ) || 0;

      return (
        total +
        price * (Number(item.quantity) || 1)
      );
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCart,
        clearCart,
        getCartItemCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ==========================================
// USE CART
// ==========================================
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
};