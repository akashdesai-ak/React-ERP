import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import Dashboard from "./components/Dashboard";
import ProductManagement from "./components/ProductManagement";
import UserManagement from "./components/UserManagement";
import OrderManagement from "./components/OrderManagement";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/home" element={<Home />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
