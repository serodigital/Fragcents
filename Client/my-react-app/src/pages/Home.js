import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [products, setProducts] = useState([]); // State for product list
    const [productCount, setProductCount] = useState(0); // State for product count

    // Display availble products 
    useEffect(() => {
        axios.get("http://localhost:8000/api/product")
            .then(response => {
                console.log(response.data);
                setProducts(response.data.products);
            })
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    // API for product count 
    useEffect(() => {
        axios.get("http://localhost:8000/api/countProduct")
            .then(response => {
                console.log("Product count:", response.data.count);
                setProductCount(response.data.count);
            })
            .catch(error => console.error("Error fetching product count:", error));
    }, []);

    return (
        <div>
            <h2>Product List</h2>
            <p>Total Products: {productCount}</p> {/* Display nomber of produts in db */}
            <ul>
                {products.map(product => (
                    <li key={product._id}>
                        <h3>{product.name} - ${product.price}</h3>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
