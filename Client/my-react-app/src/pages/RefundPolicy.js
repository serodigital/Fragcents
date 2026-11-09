import React from "react";

const RefundPolicy = () => {
  return (
    <div className="container py-5">
      <h1 className="mb-3">Refund and Cancellation Policy</h1>
      <p className="text-muted">Last updated: 2026/11/04</p>

      <h4>1. Refund Eligibility</h4>
      <ul>
        <li>Refund requests must be made within <strong>14 days</strong> of delivery.</li>
        <li>Products must be unused, unopened, and in their original packaging.</li>
        <li>Proof of purchase (order number or receipt) is required.</li>
        <li>Custom or personalised orders are non-refundable.</li>
      </ul>

      <h4>2. Non-Refundable Items</h4>
      <ul>
        <li>Opened or used fragrance products (for hygiene reasons).</li>
        <li>Gift cards and promotional items.</li>
        <li>Items marked "Final Sale".</li>
      </ul>

      <h4>3. How to Request a Refund</h4>
      <ol>
        <li>Email <a href="mailto:support@fragcents.co.za">support@fragcents.co.za</a> with your order number.</li>
        <li>We will confirm eligibility within 2 business days.</li>
        <li>Return the product to the address provided, at your own cost (unless the item was faulty or incorrect).</li>
        <li>Once received and inspected, refunds are processed within <strong>7–10 business days</strong>.</li>
      </ol>

      <h4>4. Order Cancellations</h4>
      <ul>
        <li>Orders may be cancelled within <strong>12 hours</strong> of placement, provided they have not shipped.</li>
        <li>To cancel, email us immediately with your order number.</li>
        <li>Once shipped, orders cannot be cancelled — please use the refund process instead.</li>
      </ul>

      <h4>5. Faulty or Incorrect Items</h4>
      <p>
        If you received a faulty, damaged, or incorrect item, contact us
        within <strong>48 hours</strong> of delivery. We will arrange a
        replacement or full refund, including return shipping costs.
      </p>

      <h4>7. Contact Us</h4>
      <p>
        Email: <a href="mailto:support@fragcents.co.za">support@fragcents.co.za</a>
      </p>
      <p>Phone: 072 043 1327</p>
      <p>Address: 704 Prelude, Sagewood, Midrand, South Africa.</p>
    </div>
  );
};

export default RefundPolicy;