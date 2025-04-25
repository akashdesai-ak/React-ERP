const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Import bcrypt
const User = require("./models/User"); // Import User model
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Function to create default admin user
const createDefaultUser = async () => {
  try {
    const existingUser = await User.findOne({ email: "admin@example.com" });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      const defaultUser = new User({
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      await defaultUser.save();
      console.log("Default admin user created");
    } else {
      console.log("Default admin user already exists");
    }
  } catch (err) {
    console.error("Error creating default user:", err);
  }
};

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    createDefaultUser(); // Call the function after successful connection
  })
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));