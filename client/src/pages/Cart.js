import { useCart } from "../context/cart";
import Jumbotron from "../components/cards/Jumbotron";
import {useAuth} from "../context/auth";
import UserCartSidebar from "../components/cards/UserCartSidebar";
import ProductCardHorizontal from "../components/cards/ProductCardHorizontal";

export default function Cart(){
    //context
    const [cart, setCart] = useCart();
    const [auth,setAuth] = useAuth();
    //hooks

    
    
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
                            // onClick={() => navigate('/')}
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
                <div className="col-md-8">
                    <div className="row">
                      {
                        cart?.map((p,index)=> (
                        <ProductCardHorizontal key={index} p={p}/>
                    ))}

                    </div>
                </div>

                <UserCartSidebar />
            </div>
        </div>
    )}
    </>

    )
    
}