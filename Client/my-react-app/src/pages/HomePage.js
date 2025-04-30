import React, { useEffect, useState } from "react";
import axios from "axios";
import Jumbotron from "../components/Jumbotron.js";
import ProductCard from "../components/cards/ProductCard.js";


const Home = () => {
    const [products, setProducts] = useState([]);
    const [productCount, setProductCount] = useState(0);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState("new-arrivals");
 
    // New code
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try{
            const {data} = await axios.get(`${process.env.REACT_APP_API}/list-products/${page}`);
            setProducts(data);
        }
        catch(error){
            console.log(error);
        }
    }

    const arr = [...products];
    const sortedBySold = arr?.sort((a,b) => (a.sold < b.sold ? 1 : -1))

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/list-products/${page}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchProductCount = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/countProduct");
            setProductCount(response.data.count);
            console.log("Product Count:", response.data.count); /// show number of available items in the db

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
            <Jumbotron title="Welcome Mudely" subtitle="EXPRESS YOURSELF THROUGH OUR TOP-SELLING FRAGRANCES" />


            {/* New Code */}
            <div className="row">
                <div className="col-md-6">
                    <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">
                        New Arrivals
                    </h2>
                    <div className="row">
                        {products?.map((p) => (
                            <div className="col-md-6" key={p._id}>
                                <ProductCard p={p}/>

                            </div>
                            ))}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">
                                Best Sellers
                            </h2>
                            {sortedBySold?.map((p) => (
                            <ProductCard p={p}/>
                                
                            ))}
                        </div>
                    </div>



            <div className="d-flex justify-content-center gap-4 my-4 ">
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

            {/* <h2>{activeTab === "new-arrivals" ? "New Arrivals" : "Best Sellers"}</h2> */}

            <div className="row m-5">
                {products.map(product => (
                    <div key={product._id} className="col-md-4 mb-4 ">
                        <div className="card p-3 shadow-sm border-4 ml-4">
                            {/* <div className="badge bg-dark text-uppercase mb-2">{product.category}</div> */}
                            <img src={product.image} alt={product.name} className="img-fluid mb-2" />
                            <h5>{product.name}</h5>
                            <p className="fw-bold text-grey">From R {product.price}</p>
                            {/* <p className={product.inStock ? "text-grey" : "text-grey"}>{product.inStock ? "AVAILABLE IN BULK" : "NOT AVAILABLE IN BULK"}</p> */}
                            {/* {!product.inStock && <span className="badge bg-secondary">Sold Out</span>} */}
                        </div>
                    </div>
                ))}
            </div>

            <div className="position-fixed bottom-0 end-0 mb-3 me-3 d-flex gap-2 align-items-center">
                {page > 1 && (
                    <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} className="btn text-primary">Previous</button>
                )}
                {page * 6 < productCount && (
                    <button onClick={() => setPage(prev => prev + 1)} className="btn text-primary">Load More</button>
                )}
            </div>
        </div>
    );
};

export default Home;
