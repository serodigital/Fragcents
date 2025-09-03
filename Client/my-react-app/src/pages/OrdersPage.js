import React, { useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setOrders(parsedCart);
        console.log("Fetched users: ", parsedCart); // Simulating fetched user data
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }

    console.log("Welcome to the order page"); // Welcome message
    setLoading(false);
  }, []);

  const handleRemoveItem = (itemIndex) => {
    const removedItem = orders[itemIndex];
    const updatedOrders = orders.filter((_, index) => index !== itemIndex);
    setOrders(updatedOrders);
    localStorage.setItem("cart", JSON.stringify(updatedOrders));

    setHistory((prev) => [
      ...prev,
      { action: "Removed", item: removedItem, timestamp: new Date() },
    ]);
  };

  const handleUpdateItem = (index, newQuantity) => {
    const updatedOrders = [...orders];
    updatedOrders[index].quantity = newQuantity;
    setOrders(updatedOrders);
    localStorage.setItem("cart", JSON.stringify(updatedOrders));

    setHistory((prev) => [
      ...prev,
      {
        action: "Updated Quantity",
        item: updatedOrders[index],
        timestamp: new Date(),
      },
    ]);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) return <p>Loading orders...</p>;

  const filteredOrders = orders.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛒 Your Orders</h2>

      <input
        type="text"
        placeholder="Search for an item..."
        value={searchQuery}
        onChange={handleSearch}
        style={styles.searchBox}
      />

      {filteredOrders.length === 0 ? (
        <p style={styles.emptyMsg}>Your cart is empty or no matching items.</p>
      ) : (
        <div style={styles.grid}>
          {filteredOrders.map((item, index) => (
            <div key={index} style={styles.card}>
              <img src={item.image} alt={item.name} style={styles.image} />
              <h3 style={styles.itemName}>{item.name}</h3>
              <p style={styles.itemPrice}>Price: R{item.price}</p>
              <p>Quantity:</p>
              <input
                type="number"
                value={item.quantity || 1}
                min="1"
                onChange={(e) =>
                  handleUpdateItem(index, parseInt(e.target.value, 10))
                }
                style={styles.quantityInput}
              />
              <button
                onClick={() => handleRemoveItem(index)}
                style={styles.removeButton}
              >
                🗑 Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order History */}
      {history.length > 0 && (
        <div style={styles.historySection}>
          <h3>📜 History</h3>
          <ul style={styles.historyList}>
            {history.map((entry, i) => (
              <li key={i} style={styles.historyItem}>
                {entry.action} <strong>{entry.item.name}</strong> at{" "}
                {entry.timestamp.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: "center",
    fontSize: "2.2rem",
    marginBottom: "20px",
  },
  searchBox: {
    padding: "10px",
    width: "100%",
    marginBottom: "25px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  emptyMsg: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "gray",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  itemName: {
    marginTop: "10px",
    fontSize: "1.2rem",
  },
  itemPrice: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  quantityInput: {
    padding: "5px",
    width: "60px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  removeButton: {
    backgroundColor: "#e53935",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  historySection: {
    marginTop: "40px",
    padding: "20px",
    backgroundColor: "#f1f8e9",
    borderRadius: "10px",
  },
  historyList: {
    listStyleType: "none",
    padding: 0,
  },
  historyItem: {
    padding: "5px 0",
    borderBottom: "1px solid #ccc",
  },
};

export default OrdersPage;


