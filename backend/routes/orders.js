const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("userId products.productId");
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { userId, products } = req.body;
  console.log('POST /orders received:', { userId, products });
  if (!userId || !products || !Array.isArray(products) || products.length === 0) {
    console.log('Validation failed:', { userId, products });
    return res.status(400).json({ message: "Invalid input: userId and non-empty products array are required" });
  }
  try {
    let total = 0;
    for (const item of products) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        console.log('Invalid product entry:', item);
        return res.status(400).json({ message: "Each product must have a valid productId and quantity (>0)" });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log('Product not found:', item.productId);
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      const itemTotal = product.price * item.quantity;
      console.log(`Calculating: ${product.name} ($${product.price} x ${item.quantity}) = $${itemTotal}`);
      total += itemTotal;
    }
    if (isNaN(total) || total < 0) {
      console.log('Invalid total calculated:', total);
      return res.status(400).json({ message: "Invalid total calculated" });
    }
    console.log('Order total calculated:', total);
    const order = new Order({
      userId,
      products,
      total,
      status: "pending",
    });
    await order.save();
    console.log('Order saved to database:', { _id: order._id, total: order.total });
    const populatedOrder = await Order.findById(order._id).populate("userId products.productId");
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Order save error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { userId, products, status } = req.body;
  console.log('PUT /orders/:id received:', { id: req.params.id, userId, products, status });
  if (!userId || !products || !Array.isArray(products) || products.length === 0) {
    console.log('Validation failed:', { userId, products });
    return res.status(400).json({ message: "Invalid input: userId and non-empty products array are required" });
  }
  if (status && !["pending", "completed"].includes(status)) {
    console.log('Invalid status:', status);
    return res.status(400).json({ message: "Invalid status: must be pending or completed" });
  }
  try {
    let total = 0;
    for (const item of products) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        console.log('Invalid product entry:', item);
        return res.status(400).json({ message: "Each product must have a valid productId and quantity (>0)" });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log('Product not found:', item.productId);
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      const itemTotal = product.price * item.quantity;
      console.log(`Calculating: ${product.name} (${product.price} x ${item.quantity}) = ${itemTotal}`);
      total += itemTotal;
    }
    if (isNaN(total) || total < 0) {
      console.log('Invalid total calculated:', total);
      return res.status(400).json({ message: "Invalid total calculated" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }
    order.userId = userId;
    order.products = products;
    order.total = total;
    order.status = status || order.status;
    await order.save();
    console.log('Order updated in database:', { _id: order._id, total: order.total });
    const populatedOrder = await Order.findById(order._id).populate("userId products.productId");
    res.json(populatedOrder);
  } catch (err) {
    console.error('Order update error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  console.log('DELETE /orders/:id received:', { id: req.params.id });
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      console.log('Order not found:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log('Order deleted from database:', { _id: order._id });
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error('Order delete error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;