import { useEffect, useState } from "react";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import DropIn from "braintree-web-drop-in-react";



export default function UserCartSidebar(){
    const [cart] = useCart();
    const [auth] = useAuth();

    //state
    const [clientToken, setClientToken] = useState("");
    const [instance, setInstance] = useState(""); // <-- added
    //hooks
    const navigate = useNavigate();

    useEffect(() => {
    if (!auth?.token) return;
    getClientToken();
}, [auth?.token]);

    const getClientToken = async () => {
        try {
            const { data } = await axios.get("/braintree/token", {
                headers: {
                    Authorization: `Bearer ${auth?.token}`,
                },
            });
            console.log('braintree token response:', data);           // debug
            if (data?.clientToken) {
                setClientToken(data.clientToken);
                // localStorage.setItem("client_token", data.clientToken);
            } else {
                console.warn("No clientToken returned from /braintree/token", data);
                setClientToken("");
                localStorage.removeItem("client_token");
            }
        } catch (error) {
            console.error("Error fetching client token:", error?.response || error);
        }
    };

    const cartTotal = () => {
        let total = 0;
        (cart || []).forEach((item) => {
            total += item.price || 0;
        });
        return total.toLocaleString('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        });
    };


    const handleBuy = async () => {
        try {
            const { nonce } = await instance.requestPaymentMethod(); // <-- updated
            console.log("nonce =>", nonce);

            // const { data } = await axios.post(
            //     "/braintree/payment",
            //     {
            //         nonce,
            //         cart,
            //     },
            //     {
            //         headers: {
            //             Authorization: `Bearer ${auth?.token}`,
            //         },
            //     }
            // );
            // console.log("Payment success:", data);
            // Additional actions on successful payment can be added here
        } catch (error) {
            console.error("Payment error:", error?.response || error);
        }
    };

    return (
        <div className="col-md-4 mb-5"> 
            <h4>Your cart summary</h4>
            Total / Address / Payments
            <hr />
            <h6> Total: {cartTotal()} </h6>

            {auth?.user?.address ? (
                <>
                    <div className="mb-3">
                        <hr />
                        <h4>Delivery Address: </h4>
                        <h5>{auth?.user?.address}</h5>
                    </div>
                    <button className="btn btn-outline-warning" onClick={()=> navigate("/dashboard/user/profile")}>Update Address</button>
                </>
            ) : (
                <div className="mb-3">
                    {auth?.token ? (
                        <button 
                            className="btn btn-outline-warning" 
                            onClick={()=> navigate("/dashboard/user/profile")}
                        > Add delivery Address</button>
                    ): (
                        <button 
                            className="btn btn-outline-danger mt-3" 
                            onClick={()=> navigate("/login", { state: "/cart" })}
                        >
                            Login to checkout Address
                        </button>
                    )}
                </div>
            )}

            <div className="mt-3">
               {!clientToken || !cart?.length ? (
                ""
                ) : (
                <>
                  <DropIn
                    options={{
                      authorization: clientToken,
                      paypal: { flow: "vault" },
                    }}
                    onInstance={(instance) => {
                      setInstance(instance);
                      
                    }}
                  />
                  <button 
                    onClick={handleBuy} 
                    className="btn btn-primary col-12 mt-2" 
                    disabled={!auth?.user?.address}
                    >
                        Make Payment</button>
                </>
               )}
            </div>
        </div>
    );
}
