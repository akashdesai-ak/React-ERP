const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.put("/:id", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const updateData = { email, role };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { email, password, role } = req.body;
  const validRoles = ["admin", "user", "manager", "data-entry"];
  const userRole = validRoles.includes(role) ? role : "";

  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const user = new User({
    email,
    password: hashedPassword,
    role: validRoles.includes(role) ? role : "",
  });
  await user.save();
  res.status(201).json({ message: "User created" });
});

router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// New endpoint to get valid roles
router.get("/roles", async (req, res) => {
  try {
    const roles = User.schema.path("role").enumValues; // Get enum values from schema
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
