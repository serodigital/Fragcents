import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";

const CartPage = () => {
    const { cart, removeFromCart, updateCart, clearCart } = useCart();

    // Increasing quantity
    const incrementQuantity = (itemId) => {
        const item = cart.find((cartItem) => cartItem._id === itemId);
        if (item) {
            updateCart(itemId, item.quantity + 1);
        }
    };

    // Decreasing quantity
    const decrementQuantity = (itemId) => {
        const item = cart.find((cartItem) => cartItem._id === itemId);
        if (item && item.quantity > 1) {
            updateCart(itemId, item.quantity - 1);
        }
    };

    // Calculate total price of items in the cart
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="container mt-4">
         <div className="d-flex align-items-center mb-4">
  <h3 className="mb-0 me-2 ">🛒 Shopping Cart:</h3> {/* Adjust margin and font size */}
  <p className="mt-4 ms-2">
  ({cart.length}<span className="ms-1">items</span>)
</p>
</div>

            <div className="row ">
                <div className="col-md-8 mb-4">
                    {cart.length === 0 ? (//check whether cart is empty 
                        <Link to="/">
                <button
                className="btn btn-sm border rounded"
                style={{
                    backgroundColor: 'white',
                    transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#d6d6d6'}
                onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                >
                ⬅︎ Continue Shopping
                </button>
                        </Link>
                        
                    ) : (
                        <div>
                            {cart.map((item,index) => (
                                <div key={item._id} 
                                className={`mb-3 p-3 ${index === 0 ? 'border-top' : ''} border-bottom`}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        {/* Left: Image and Name */}
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                width="80"
                                                height="80"
                                                style={{ objectFit: "cover" }}
                                                className="me-3"
                                            />
                                            <h5 className="mb-0">{item.name}</h5>
                                        </div>

                                        {/* Right: Quantity + Price */}
                                        <div className="d-flex align-items-center">
                                            <div className="input-group input-group-sm me-5 border rounded" style={{ width: "100px" }}>
                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => decrementQuantity(item._id)}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="form-control text-center border-0 focus:ring-0"
                                                    value={item.quantity}
                                                    min="1"
                                                    readOnly
                                                />
                                                <button
                                                    className="btn"
                                                    type="button"
                                                    onClick={() => incrementQuantity(item._id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {/* /* Render total price for the item (unit price * quantity), formatted to 2 decimal places */}
                                                <p className="mb-0">
                                                ${(item.price * item.quantity).toFixed(2)}
                                                </p>


                                        </div>
                                    </div>

                                    {/* Save and Remove buttons */}
                                    <div className="d-flex align-items-center ms-5">
                                        <button className="btn btn-sm ms-5">🤍 Save for Later</button>
                                        <button className="btn btn-sm" onClick={() => removeFromCart(item._id)}>🗑️ Remove</button>
                                    </div>
                                </div>
                                                ))}
                    {cart.length >= 3 && (
                    <button className="btn border mt-3" onClick={clearCart}>
                        Clear Cart
                    </button>
                    )}
                        </div>
                    )}
                </div>

                {/* Payment Summary */}
                {cart.length > 0 && (
    <div className="col-md-4 mb-3">
        <div className="card" style={{ backgroundColor: '#f1f8f4', border: 'none' }}>
            <div className="card-body">
                <h4 className="card-title mt-2">Payment Summary</h4>
                <ul className="list-unstyled">
                    <li className="d-flex justify-content-between pt-3">
                        <span>Subtotal </span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </li>
                    <li className="d-flex justify-content-between mb-4 pt-3">
                        <span>Delivery</span>
                        <strong>$0.00</strong>
                    </li>
                    <li className="d-flex justify-content-between mb-4 border-top border-bottom border-solid border-black pt-3 pb-3">
                        <span><strong>Order Total</strong></span>
                        <strong>${totalPrice.toFixed(2)}</strong>
                    </li>
                </ul>
                <button className="btn btn-primary w-100 mt-2 border-none">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    </div>
)}


            </div>
        </div>
    );
};

export default CartPage;
