import React, { useEffect, useState } from "react";
import axios from "axios";
import Jumbotron from "../components/Jumbotron";
import ProductCard from "../components/cards/ProductCard";


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



          
        </div>
    );
};

export default Home;


