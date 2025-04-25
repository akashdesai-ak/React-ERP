const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a product
// router.post('/', async (req, res) => {
//   const { name, price, quantity } = req.body;
//   if (!name || typeof price !== 'number' || price <= 0 || typeof quantity !== 'number' || quantity < 0) {
//     return res.status(400).json({ message: 'Invalid input: name, price (>0), and quantity (>=0) are required' });
//   }
//   try {
//     const product = new Product({ name, price, quantity });
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.post('/', async (req, res) => {
  const { name, price, quantity } = req.body;
  if (!name || typeof price !== 'number' || price <= 0 || typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: 'Invalid input: name, price (>0), and quantity (>=0) are required' });
  }
//   try {
//     const product = new Product({ name, price, quantity });
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

  try {
    const product = new Product({ name, price, quantity });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  const { name, price, quantity } = req.body;
  if (
    !name ||
    typeof price !== "number" ||
    price <= 0 ||
    typeof quantity !== "number" ||
    quantity < 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid input: name, price (>0), and quantity (>=0) are required",
      });
  }
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
