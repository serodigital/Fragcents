import { useCart } from "../context/cart";
import Jumbotron from "../components/cards/Jumbotron";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/auth";

export default function Cart(){
    //context
    const [cart, setCart] = useCart();
    const [auth,setAuth] = useAuth();
    //hooks
    const navigate = useNavigate();

    return (
    <>
        <Jumbotron title={`Hello ${auth?.token  && auth?.user?.name}`} 
        subtitle={cart.length > 0 ? `You have ${cart?.length} items in the cart. ${
            auth?.token ? "" : "Please log in to checkout"
        }` 
        : "Your cart is empty"
    } 
    />

    <div className="container-fluid">
        <div className="row">
            <div className="col-md-12">
                <div className="p-3 mt-2 h4 bg-light text-center">
                    {cart?.length > 0 ? 'My Cart' : <div className="text-center">
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </button>
                        </div>}
                </div>
            </div>
        </div>
    </div>

    {cart?.length > 0 && (
        <div className="container">
            <div className="row">
                <div className="col-md-9">
                    {cart?.map(c => <div key={c._id}>{c.name}</div>)}
                </div>

                <div className="col-md-3"> Total / Address / Payments</div>
            </div>
        </div>
    )}
    </>

    )
    
}