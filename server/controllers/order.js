import orderModel from "../models/order.js";

// Create a new order (checkout)
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryFee, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const order = await new orderModel({
      buyer: req.user._id,
      items,
      totalAmount,
      deliveryFee: deliveryFee || 0,
      deliveryAddress,
    }).save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error,
    });
  }
};

// Get orders for the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching your orders",
      error,
    });
  }
};

// Get ALL orders (manager/finances use)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error,
    });
  }
};

// Get finance summary (manager/finances use)
export const getFinanceSummary = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    // Revenue for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth,
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = monthDate.toLocaleString("en-ZA", {
        month: "short",
        year: "2-digit",
      });
      const nextMonthDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1,
      );
      const monthOrders = orders.filter((o) => {
        const created = new Date(o.createdAt);
        return created >= monthDate && created < nextMonthDate;
      });
      const monthTotal = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      monthlyRevenue.push({ month: monthLabel, revenue: monthTotal });
    }

    // Top selling products (by quantity across all orders)
    const productTotals = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productTotals[item.name]) {
          productTotals[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productTotals[item.name].quantity += item.quantity;
        productTotals[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders.length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        monthlyRevenue,
        topProducts,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error calculating finance summary",
      error,
    });
  }
};

// Update order status (manager only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error,
    });
  }
};
