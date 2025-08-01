import { useCart } from "../../Context/CartContext"; 

import moment from "moment";


// Currency from Dollar to Rand commit Config
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
    }).format(amount);
};


export default function ProductCard({ p }) {
    const { addToCart } = useCart();

    return (
        <div className="card mb-3" key={p._id}>
            {p.photo && p.photo.data ? (
                          <img
                            src={`data:${p.photo.contentType};base64,${Buffer.from(
                              p.photo.data
                            ).toString("base64")}`}
                            alt={p.name}
                            style={{ height: "400px" }}
                            className="img-thumbnail"
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}

            <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="text-muted">{moment(p.createdAt).fromNow()}</p>
                { <p className="fw-bold">{p.sold} sold</p> }

                <p className="text-success fw-bold">{formatCurrency(p.price)}</p>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        // Log item in console when button is clicked(testing)
                        console.log("Add to cart clicked", p);

                        // Add item to cart 
                        addToCart({
                            _id: p._id,
                            name: p.name,
                            price: formatCurrency(p.price),
                            image: `http://localhost:8000/api/product/images/${p._id}`
                        });

                        //  alert-----------
                        alert(`${p.name} added to cart `);
                    }}
                >
                    🛒 Add to Cart
                </button>
            </div>
        </div>
    );
}
