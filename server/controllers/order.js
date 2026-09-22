import orderModel from "../models/order.js";

// Get orders for the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
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

// Get ALL orders (admin use)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("user", "name email")
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

// Get finance summary (manager use)
export const getFinanceSummary = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth,
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );

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

    const productTotals = {};
    orders.forEach((order) => {
      (order.products || []).forEach((item) => {
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

// Update order status (admin use)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      id,
      { orderStatus },
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
