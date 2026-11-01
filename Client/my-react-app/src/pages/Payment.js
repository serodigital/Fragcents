import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Payment = () => {
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  // ==========================================
  // LOAD PENDING ORDER
  // ==========================================

  useEffect(() => {
    const savedOrder = localStorage.getItem("pendingOrder");

    if (!savedOrder) {
      toast.error("No pending order found.");
      navigate("/SecureCheckout");
      return;
    }

    try {
      const parsedOrder = JSON.parse(savedOrder);

      console.log("=================================");
      console.log("PENDING ORDER LOADED");
      console.log("=================================");
      console.log(JSON.stringify(parsedOrder, null, 2));
      console.log("=================================");

      if (!parsedOrder.customer) {
        toast.error(
          "Customer information is missing. Please return to checkout."
        );
        navigate("/SecureCheckout");
        return;
      }

      if (!parsedOrder.deliveryAddress) {
        toast.error(
          "Delivery information is missing. Please return to checkout."
        );
        navigate("/SecureCheckout");
        return;
      }

      if (
        !Array.isArray(parsedOrder.products) ||
        parsedOrder.products.length === 0
      ) {
        toast.error(
          "Your order has no products. Please return to your cart."
        );
        navigate("/cart");
        return;
      }

      setOrder(parsedOrder);
    } catch (error) {
      console.error("ERROR LOADING PENDING ORDER:", error);

      localStorage.removeItem("pendingOrder");

      toast.error("Unable to load your order.");
      navigate("/SecureCheckout");
    }
  }, [navigate]);

  // ==========================================
  // GENERATE ORDER NUMBER
  // ==========================================

  const generateOrderNumber = () => {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    return `FRAG-${randomNumber}`;
  };

  // ==========================================
  // VALIDATE ORDER
  // ==========================================

  const validateOrder = () => {
    if (!order) {
      toast.error("Order information is missing.");
      return false;
    }

    if (
      !order.customer ||
      !order.customer.name ||
      !order.customer.email ||
      !order.customer.phone
    ) {
      console.log("MISSING CUSTOMER:", order.customer);

      toast.error(
        "Customer information is missing. Please return to checkout."
      );

      return false;
    }

    if (
      !order.deliveryAddress ||
      !order.deliveryAddress.address ||
      !order.deliveryAddress.city ||
      !order.deliveryAddress.postalCode
    ) {
      console.log(
        "MISSING DELIVERY:",
        order.deliveryAddress
      );

      toast.error(
        "Delivery information is missing. Please return to checkout."
      );

      return false;
    }

    if (
      !Array.isArray(order.products) ||
      order.products.length === 0
    ) {
      toast.error(
        "Your order has no products. Please return to your cart."
      );

      return false;
    }

    return true;
  };

  // ==========================================
  // HANDLE PAYMENT
  // ==========================================

  const handlePayment = async () => {
    if (processing) {
      return;
    }

    if (!validateOrder()) {
      return;
    }

    setProcessing(true);

    toast.loading(
      "Verifying your Paystack payment...",
      {
        id: "payment-processing",
      }
    );

    try {
      // ==========================================
      // GET PAYSTACK REFERENCE
      // ==========================================

      const savedReference =
        localStorage.getItem("paystackReference");

      if (!savedReference) {
        throw new Error(
          "Paystack payment reference was not found."
        );
      }

      console.log("=================================");
      console.log("PAYSTACK PAYMENT REFERENCE");
      console.log("=================================");
      console.log(savedReference);
      console.log("=================================");

      setPaymentReference(savedReference);

      // ==========================================
      // VERIFY PAYMENT WITH BACKEND
      // ==========================================

      const verifyResponse =
        await axios.get(
          `http://localhost:8000/api/paystack/verify/${savedReference}`
        );

      console.log("=================================");
      console.log("PAYSTACK VERIFICATION RESPONSE");
      console.log("=================================");
      console.log(
        JSON.stringify(
          verifyResponse.data,
          null,
          2
        )
      );
      console.log("=================================");

      const paymentData =
        verifyResponse.data?.data;

      if (
        !verifyResponse.data?.success ||
        !paymentData
      ) {
        throw new Error(
          "Unable to verify Paystack payment."
        );
      }

      // ==========================================
      // PAYMENT MUST BE SUCCESSFUL
      // ==========================================

      if (paymentData.status !== "success") {
        throw new Error(
          `Payment was not successful. Paystack status: ${paymentData.status}`
        );
      }

      // ==========================================
      // CHECK PAYMENT AMOUNT
      // ==========================================

      const expectedAmount =
        Math.round(
          Number(order.totalAmount) * 100
        );

      const paidAmount =
        Number(paymentData.amount);

      if (paidAmount !== expectedAmount) {
        console.error(
          "AMOUNT MISMATCH:",
          {
            expectedAmount,
            paidAmount,
          }
        );

        throw new Error(
          "Payment amount does not match the order amount."
        );
      }

      // ==========================================
      // GENERATE ORDER NUMBER
      // ==========================================

      const newOrderNumber =
        generateOrderNumber();

      // ==========================================
      // PREPARE PRODUCTS
      // ==========================================

      const products =
        order.products.map((item) => {
          const productId =
            item.product || item._id;

          if (!productId) {
            throw new Error(
              `Product ID is missing for ${
                item.name || "an item"
              }.`
            );
          }

          if (!item.name) {
            throw new Error(
              "Product name is missing."
            );
          }

          const quantity = Number(
            item.quantity || 1
          );

          const price = Number(item.price);

          if (
            !Number.isFinite(quantity) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid quantity for ${item.name}.`
            );
          }

          if (
            !Number.isFinite(price) ||
            price < 0
          ) {
            throw new Error(
              `Invalid price for ${item.name}.`
            );
          }

          return {
            product: productId,
            name: item.name.trim(),
            quantity,
            price,
          };
        });

      // ==========================================
      // CUSTOMER
      // ==========================================

      const customer = {
        name: order.customer.name.trim(),
        email: order.customer.email.trim(),
        phone: order.customer.phone.trim(),
      };

      // ==========================================
      // DELIVERY ADDRESS
      // ==========================================

      const deliveryAddress = {
        address:
          order.deliveryAddress.address.trim(),

        city:
          order.deliveryAddress.city.trim(),

        postalCode:
          order.deliveryAddress.postalCode.trim(),

        ...(order.deliveryAddress.province && {
          province:
            order.deliveryAddress.province.trim(),
        }),

        ...(order.deliveryAddress.country && {
          country:
            order.deliveryAddress.country.trim(),
        }),
      };

      // ==========================================
      // MONEY
      // ==========================================

      const subtotal =
        Number(order.subtotal) || 0;

      const deliveryFee =
        Number(order.deliveryFee) || 0;

      const totalAmount =
        Number(order.totalAmount) || 0;

      // ==========================================
      // CREATE PAID ORDER
      // ==========================================

      const completedOrder = {
        orderNumber: newOrderNumber,

        user: order.user || null,

        customer,

        deliveryAddress,

        products,

        subtotal:
          Number(subtotal.toFixed(2)),

        deliveryFee:
          Number(deliveryFee.toFixed(2)),

        totalAmount:
          Number(totalAmount.toFixed(2)),

        paymentMethod: "Paystack",

        paymentReference:
          savedReference,

        paymentStatus: "paid",

        orderStatus: "processing",

        paidAt:
          new Date().toISOString(),
      };

      // ==========================================
      // DEBUG
      // ==========================================

      console.log("=================================");
      console.log("PAYSTACK PAYMENT VERIFIED");
      console.log("=================================");
      console.log(
        "Order Number:",
        newOrderNumber
      );
      console.log(
        "Payment Reference:",
        savedReference
      );
      console.log(
        "Payment Status:",
        paymentData.status
      );
      console.log(
        "Order Being Sent To Server:"
      );
      console.log(
        JSON.stringify(
          completedOrder,
          null,
          2
        )
      );
      console.log("=================================");

      // ==========================================
      // SAVE ORDER TO DATABASE
      // ==========================================

      const response =
        await axios.post(
          "http://localhost:8000/api/order/create",
          completedOrder,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      console.log("=================================");
      console.log("DATABASE ORDER RESPONSE");
      console.log("=================================");
      console.log(response.data);
      console.log("=================================");

      // ==========================================
      // SUCCESS
      // ==========================================

      if (
        response.data &&
        response.data.success
      ) {
        const savedOrder =
          response.data.order ||
          completedOrder;

        const savedOrderNumber =
          savedOrder.orderNumber ||
          newOrderNumber;

        setOrderNumber(
          savedOrderNumber
        );

        setProcessing(false);

        toast.dismiss(
          "payment-processing"
        );

        toast.success(
          "Payment successful! Order created."
        );

        setPaymentSuccess(true);

        // Save completed order
        localStorage.setItem(
          "completedOrder",
          JSON.stringify(savedOrder)
        );

        // Remove pending order
        localStorage.removeItem(
          "pendingOrder"
        );

        // Remove Paystack reference
        localStorage.removeItem(
          "paystackReference"
        );
      } else {
        throw new Error(
          response.data?.message ||
            "Order could not be created."
        );
      }
    } catch (error) {
      console.error(
        "================================="
      );
      console.error(
        "PAYSTACK PAYMENT / ORDER ERROR"
      );
      console.error(
        "================================="
      );

      console.error(error);

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      console.error(
        "HTTP STATUS:",
        error.response?.status
      );

      console.error(
        "================================="
      );

      setProcessing(false);

      toast.dismiss(
        "payment-processing"
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment verification failed."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success mb-3"></div>

        <h5>
          Loading payment...
        </h5>
      </div>
    );
  }

  // ==========================================
  // PAYMENT SUCCESS
  // ==========================================

  if (paymentSuccess) {
    return (
      <div className="container py-5">
        <div
          className="card shadow-sm mx-auto"
          style={{
            maxWidth: "650px",
          }}
        >
          <div className="card-body text-center p-5">

            <div
              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
                fontSize: "40px",
              }}
            >
              ✓
            </div>

            <h2 className="fw-bold text-success">
              Payment Successful!
            </h2>

            <p className="text-muted">
              Thank you for your purchase.
            </p>

            <hr />

            <div className="row text-start mt-4">

              <div className="col-6 mb-3">
                <small className="text-muted">
                  Order Number
                </small>

                <div className="fw-bold">
                  {orderNumber}
                </div>
              </div>

              <div className="col-6 mb-3">
                <small className="text-muted">
                  Amount Paid
                </small>

                <div className="fw-bold">
                  R
                  {Number(
                    order.totalAmount
                  ).toFixed(2)}
                </div>
              </div>

              <div className="col-6">
                <small className="text-muted">
                  Payment Method
                </small>

                <div className="fw-bold">
                  Paystack
                </div>
              </div>

              <div className="col-6">
                <small className="text-muted">
                  Status
                </small>

                <div className="text-success fw-bold">
                  Paid
                </div>
              </div>

            </div>

            <div className="text-start mt-4">

              <small className="text-muted">
                Customer
              </small>

              <div className="fw-bold">
                {order.customer.name}
              </div>

              <div className="text-muted">
                {order.customer.email}
              </div>

              <div className="text-muted">
                {order.customer.phone}
              </div>

            </div>

            <div className="text-start mt-3">

              <small className="text-muted">
                Delivery Address
              </small>

              <div>
                {order.deliveryAddress.address}
              </div>

              <div>
                {order.deliveryAddress.city},{" "}
                {order.deliveryAddress.postalCode}
              </div>

              {order.deliveryAddress.province && (
                <div>
                  {order.deliveryAddress.province}
                </div>
              )}

              {order.deliveryAddress.country && (
                <div>
                  {order.deliveryAddress.country}
                </div>
              )}

            </div>

            <button
              className="btn btn-success w-100 mt-4"
              onClick={() =>
                navigate("/")
              }
            >
              Continue Shopping
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAYMENT PAGE
  // ==========================================

  return (
    <div className="container py-5">

      <h2 className="mb-2">
        Payment
      </h2>

      <p className="text-muted mb-4">
        Complete your payment securely with
        Paystack.
      </p>

      <div className="row g-4">

        <div className="col-md-7">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Payment Method
              </h5>

              <div className="border border-success border-2 rounded p-3 mb-3">

                <div className="form-check">

                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentProvider"
                    checked={true}
                    readOnly
                  />

                  <label className="form-check-label">

                    <strong>
                      Paystack
                    </strong>

                    <br />

                    <small className="text-muted">
                      Secure online payment
                    </small>

                  </label>

                </div>

              </div>

              <div className="bg-light rounded p-4 mb-3">

                <h6 className="fw-bold mb-3">
                  Paystack Payment
                </h6>

                <p className="text-muted mb-3">
                  Your payment has been
                  initiated through Paystack.
                </p>

                <div className="alert alert-info mb-0">
                  <strong>
                    Test Mode
                  </strong>

                  <br />

                  <small>
                    This is a Paystack test
                    payment. No real money will
                    be transferred.
                  </small>
                </div>

              </div>

              <button
                className="btn btn-success w-100 mt-4"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>

                    Verifying Payment...
                  </>
                ) : (
                  <>
                    Confirm Payment
                  </>
                )}
              </button>

              <button
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() =>
                  navigate(
                    "/SecureCheckout"
                  )
                }
                disabled={processing}
              >
                Back to Checkout
              </button>

            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}

        <div className="col-md-5">

          <div className="card shadow-sm">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                Order Summary
              </h5>

              {order.products.map(
                (item, index) => (
                  <div
                    key={
                      item.product ||
                      item._id ||
                      index
                    }
                    className="d-flex justify-content-between border-bottom py-2"
                  >

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <br />

                      <small className="text-muted">
                        Qty:{" "}
                        {item.quantity}
                      </small>
                    </div>

                    <span>
                      R
                      {(
                        Number(item.price) *
                        Number(
                          item.quantity || 1
                        )
                      ).toFixed(2)}
                    </span>

                  </div>
                )
              )}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>
                  Subtotal
                </span>

                <span>
                  R
                  {Number(
                    order.subtotal
                  ).toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>
                  Delivery
                </span>

                <span>
                  {Number(
                    order.deliveryFee
                  ) === 0
                    ? "FREE"
                    : `R${Number(
                        order.deliveryFee
                      ).toFixed(2)}`}
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between">

                <strong>
                  Total
                </strong>

                <strong>
                  R
                  {Number(
                    order.totalAmount
                  ).toFixed(2)}
                </strong>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;