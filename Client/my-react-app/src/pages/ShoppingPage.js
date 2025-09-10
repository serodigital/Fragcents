import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Jumbotron from "../components/Jumbotron";
import ProductCard from "../components/cards/ProductCard";

const ShoppingPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    availability: '',
    search: ''
  });
  
  const arr = [...filteredProducts];
  const sortedBySold = arr?.sort((a, b) => (a.sold < b.sold ? 1 : -1));

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/products");
      if (data.products) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.products.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
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
      console.log("Product Count:", response.data.count);
    } catch (error) {
      console.error("Error fetching product count:", error);
    }
  }, []);

  // Filter products based on current filters
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max;
        } else {
          return p.price >= min;
        }
      });
    }

    // Availability filter
    if (filters.availability === 'in-stock') {
      filtered = filtered.filter(p => p.quantity > 0);
    } else if (filters.availability === 'out-of-stock') {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      availability: '',
      search: ''
    });
  };

  useEffect(() => {
    fetchProducts();
    fetchProductCount();
  }, [fetchProducts, fetchProductCount]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div>
      <Jumbotron title="EXPRESS YOURSELF THROUGH OUR TOP-SELLING FRAGRANCES" />
      
      <div className="container-fluid">
        <div className="row">
          {/* Filter Sidebar */}
          <div className="col-md-3 col-lg-2">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Filters</h5>
                <button 
                  className="btn btn-link btn-sm p-0"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>
              <div className="card-body">
                {/* Search Filter */}
                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-3">
                  <label className="form-label">Price Range</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  >
                    <option value="">All Prices</option>
                    <option value="0-50">R0 - R50</option>
                    <option value="50-100">R50 - R100</option>
                    <option value="100-200">R100 - R200</option>
                    <option value="200-500">R200 - R500</option>
                    <option value="500">R500+</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="mb-3">
                  <label className="form-label">Availability</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                  >
                    <option value="">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="text-muted small">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-md-9 col-lg-10">
            <div className="row">
              <div className="col-md-6">
                <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">New Arrivals</h2>
                <div className="row">
                  {filteredProducts?.map((p) => (
                    <div className="col-lg-4 col-md-6 col-sm-12" key={p._id}>
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <h2 className="p-3 mt-2 mb-2 h4 bg-light text-center">Best Sellers</h2>
                <div className="row">
                  {sortedBySold?.map((p) => (
                    <div className="col-lg-4 col-md-6 col-sm-12" key={p._id}>
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;