import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../components/Jumbotron";
import ProductCard from "../components/cards/ProductCard";


const Home = () => {
    const [products, setProducts] = useState([]);
    const [productCount, setProductCount] = useState(0);
    const [page, setPage] = useState(1);

    const arr = [...products];
    const sortedBySold = arr?.sort((a, b) => (a.sold < b.sold ? 1 : -1))

    // Removed misplaced import statement for useCallback

  // Use useCallback to memoize the fetch functions
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/product");
      if (data.products) {
        setProducts(data.products);
      } else {
        console.error("No products found in the response");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

    const fetchProductCount = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/countProduct");
            setProductCount(response.data.count);
            console.log("Product Count:", response.data.count); /// show number of available items in the db

        } catch (error) {
            console.error("Error fetching product count:", error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchProductCount();
    }, [fetchProducts, fetchProductCount]);

    return (
        <div>
            <Jumbotron title="EXPRESS YOURSELF THROUGH OUR TOP-SELLING FRAGRANCES"/>

            {/* New Code */}
            <div className="row">
                <div className="col-md-6">
                    <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">
                        New Arrivals
                    </h2>
                    <div className="row">
                        {products?.map((p) => (
                            <div className="col-md-6" key={p._id}>
                                <ProductCard p={p} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-md-6">
                    <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">
                        Best Sellers
                    </h2>
                    <div className="row">
                    {sortedBySold?.map((p) => (
                        <div className="col-md-6" key={p._id}>
                        <ProductCard p={p} />
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Home;


