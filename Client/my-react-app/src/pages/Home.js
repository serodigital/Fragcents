import React, { useEffect, useState } from "react";
import axios from "axios";
import Jumbotron from "../components/Jumbotron.js";

const Home = () => {
    const [products, setProducts] = useState([]); 
    const [productCount, setProductCount] = useState(0); 
    const [page, setPage] = useState(1); 
    const [activeTab, setActiveTab] = useState("new-arrivals");

    // Fetch 6 products per page from the API
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/list-products/page/${page}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Fetch total number of products in the database
    const fetchProductCount = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/countProduct");
            setProductCount(response.data.count);
            console.log("Available products in DB:", response.data.count);
        } catch (error) {
            console.error("Error fetching product count:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchProductCount();
    }, [page]);

    return (
        <div>
            {/* Jumbotron Section */}
            <Jumbotron 
                title="Welcome to Mudely" 
                subtitle="EXPRESS YOURSELF THROUGH OUR TOP-SELLING FRAGRANCES"
            />

            {/* Navigation Buttons Below Jumbotron */}
            <div className="d-flex justify-content-center gap-4 my-4">
                <button 
                    className={`btn position-relative ${activeTab === "new-arrivals" ? "fw-bold text-dark border-bottom border-3 border-dark" : "text-muted"}`} 
                    onClick={() => setActiveTab("new-arrivals")}
                    style={{ background: "none", border: "none", fontSize: "18px" }}
                >
                    New Arrivals
                </button>

                <button 
                    className={`btn position-relative ${activeTab === "best-sellers" ? "fw-bold text-dark border-bottom border-3 border-dark" : "text-muted"}`} 
                    onClick={() => setActiveTab("best-sellers")}
                    style={{ background: "none", border: "none", fontSize: "18px" }}
                >
                    Best Sellers
                </button>
            </div>

            <h2>{activeTab === "new-arrivals" ? "New Arrivals" : "Best Sellers"}</h2>

            <ul>
                {products.map(product => (
                    <li key={product._id}>
                        <h3>{product.name} - ${product.price}</h3>
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="position-fixed bottom-0 end-0 mb-3 me-3 d-flex gap-2 align-items-center">
                            
                            <button 
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                                disabled={page === 1}
                                className="btn btn-primary"
                            >
                                Previous
                            </button>

                            <span className="fw-bold"> Page {page} </span>

                            <button 
                                onClick={() => setPage(prev => (prev * 6 < productCount ? prev + 1 : prev))}
                                disabled={page * 6 >= productCount}
                                className="btn btn-outline-primary"
                            >
                                View More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
