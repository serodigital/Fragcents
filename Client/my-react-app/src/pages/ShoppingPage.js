import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Jumbotron from "../components/Jumbotron";
import ProductCard from "../components/cards/ProductCard";

const ShoppingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: "",
    availability: "",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category") || "",
      search: searchParams.get("search") || "",
    }));
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/products");
      if (data.products) {
        setProducts(data.products);
        setFilteredProducts(data.products);

        const seen = new Map();
        data.products.forEach((p) => {
          if (p.category && p.category._id) {
            seen.set(p.category._id, p.category);
          }
        });
        setCategories(Array.from(seen.values()));
      } else {
        console.error("No products found in the response");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.category) {
      filtered = filtered.filter((p) => p.category?._id === filters.category);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter((p) => {
        if (max) {
          return p.price >= min && p.price <= max;
        } else {
          return p.price >= min;
        }
      });
    }

    if (filters.availability === "in-stock") {
      filtered = filtered.filter((p) => p.quantity > 0);
    } else if (filters.availability === "out-of-stock") {
      filtered = filtered.filter((p) => p.quantity === 0);
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: "",
      availability: "",
      search: "",
    });
    setSortBy("newest");
    navigate("/shop", { replace: true });
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // One list, sorted the way the customer chooses
  const displayedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "best") return (b.sold || 0) - (a.sold || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeCategoryName = filters.category
    ? categories.find((c) => c._id === filters.category)?.name
    : null;

  return (
    <div>
      <Jumbotron title="EXPRESS YOURSELF THROUGH OUR TOP-SELLING FRAGRANCES" />

      <div className="container-fluid">
        <div className="row">
          {/* Filters */}
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
                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Price Range</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.priceRange}
                    onChange={(e) =>
                      handleFilterChange("priceRange", e.target.value)
                    }
                  >
                    <option value="">All Prices</option>
                    <option value="0-50">R0 - R50</option>
                    <option value="50-100">R50 - R100</option>
                    <option value="100-200">R100 - R200</option>
                    <option value="200-500">R200 - R500</option>
                    <option value="500">R500+</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Availability</label>
                  <select
                    className="form-select form-select-sm"
                    value={filters.availability}
                    onChange={(e) =>
                      handleFilterChange("availability", e.target.value)
                    }
                  >
                    <option value="">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div className="text-muted small">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-md-9 col-lg-10">
            {activeCategoryName && (
              <div className="alert alert-info py-2 px-3 mb-3">
                Showing category: <strong>{activeCategoryName}</strong>
              </div>
            )}
            {filters.search && (
              <div className="alert alert-info py-2 px-3 mb-3">
                Search results for: <strong>{filters.search}</strong>
              </div>
            )}

            <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-3 gap-2">
              <h2 className="h4 mb-0">Our Fragrances</h2>
              <div className="d-flex align-items-center gap-2">
                <label className="form-label mb-0 small text-muted">
                  Sort by
                </label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="best">Best sellers</option>
                </select>
              </div>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="row g-4 mb-5">
                {displayedProducts.map((p) => (
                  <div className="col-6 col-md-4 col-xl-3" key={p._id}>
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted my-5 text-center">
                No products match your filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
