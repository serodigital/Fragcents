import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [products, setProducts] = useState([]); 
    const [productCount, setProductCount] = useState(0); 
    const [page, setPage] = useState(1); 

    // fetch 6 products per page from the API
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/list-products/page/${page}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    //   fetch the total number of products in the database
    const fetchProductCount = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/countProduct");
            setProductCount(response.data.count);

            console.log("Availble product in db :", response.data.count);

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
            <h2>Product List</h2>
            {/* <p>Total Products: {productCount}</p> */}

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
                    view more
                </button>
            </div>
        </div>
    </div>
</div>

        </div>
    );
};

export default Home;
