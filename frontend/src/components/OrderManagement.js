import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getProducts,
  getUsers,
} from "../api/api";
import { AuthContext } from '../context/AuthContext';
import { Link } from "react-router-dom";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    status: "pending",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editOrderId, setEditOrderId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getOrders(), getProducts(), getUsers()])
      .then(([ordersRes, productsRes, usersRes]) => {
        setOrders(ordersRes.data);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.productId) newErrors.productId = "Product is required";
    if (!form.quantity || parseInt(form.quantity) <= 0)
      newErrors.quantity = "Quantity must be a positive number";
    if (!["pending", "completed"].includes(form.status))
      newErrors.status = "Status must be pending or completed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalPreview = () => {
    if (!form.productId || !form.quantity || parseInt(form.quantity) <= 0)
      return 0;
    const product = products.find((p) => p._id === form.productId);
    if (!product) return 0;
    return (product.price * parseInt(form.quantity)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!user?.userId) {
      setSubmitError('You must be logged in to create or update an order');
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      const order = {
        userId: user.userId, // Use logged-in user's ID
        products: [{ productId: form.productId, quantity: parseInt(form.quantity) }],
        total: parseFloat(getTotalPreview()),
        status: form.status,
      };
      if (editOrderId) {
        // Update existing order
        await updateOrder(editOrderId, order);
        setEditOrderId(null);
      } else {
        // Create new order
        await addOrder(order);
      }
      setForm({ productId: '', quantity: '', status: 'pending' });
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setSubmitError(err.response?.data?.message || editOrderId ? 'Failed to update order' : 'Failed to add order');
      console.error(editOrderId ? 'Update order error:' : 'Add order error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditOrderId(order._id);
    setForm({
      productId: order.products[0]?.productId?._id || "",
      quantity: order.products[0]?.quantity?.toString() || "",
      status: order.status,
    });
    setErrors({});
    setSubmitError("");
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      console.log("Deleting order:", id);
      await deleteOrder(id);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to delete order");
      console.error("Delete order error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditOrderId(null);
    setForm({ productId: "", quantity: "", status: "pending" });
    setErrors({});
    setSubmitError("");
  };

  if (!user) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        Please log in to manage orders
      </Typography>
      <Typography variant="body1">
        <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline' }}>
          Click here to log in
        </Link>
      </Typography>
    </Box>
    )
  }


  if (!user) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Please log in to manage products
        </Typography>
        <Typography variant="body1">
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline' }}>
            Click here to log in
          </Link>
        </Typography>
      </Box>
    );
  }


  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}
      >
        <TextField
          label="Ordered By"
          value={user.email || "N/A"}
          InputProps={{ readOnly: true }}
          sx={{ flex: "1 1 200px" }}
          variant="filled"
          aria-readonly="true"
        />
        <FormControl sx={{ flex: "1 1 200px" }} error={!!errors.productId}>
          <InputLabel>Product</InputLabel>
          <Select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            label="Product"
            required
            aria-required="true"
          >
            {products.map((product) => (
              <MenuItem key={product._id} value={product._id}>
                {product.name} (₹{product.price.toFixed(2)})
              </MenuItem>
            ))}
          </Select>
          {errors.productId && (
            <Typography color="error" variant="caption">
              {errors.productId}
            </Typography>
          )}
        </FormControl>
        <TextField
          label="Quantity"
          type="number"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          error={!!errors.quantity}
          helperText={errors.quantity}
          sx={{ flex: "1 1 200px" }}
          required
          aria-required="true"
          inputProps={{ min: 1 }}
        />
        <FormControl sx={{ flex: "1 1 200px" }} error={!!errors.status}>
          <InputLabel>Status</InputLabel>
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            label="Status"
            required
            aria-required="true"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
          {errors.status && (
            <Typography color="error" variant="caption">
              {errors.status}
            </Typography>
          )}
        </FormControl>
        <Typography
          variant="body2"
          sx={{ flex: "1 1 200px", alignSelf: "center" }}
        >
          Estimated Total: ₹{getTotalPreview()}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-start" }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : editOrderId ? (
              "Update Order"
              
            ) : (
              "Add Order"
            )}
          </Button>
          {editOrderId && (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                fontWeight: "500"
              }}
            >
              <TableCell>Ordered By</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order._id}
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}
              >
                <TableCell>{order.userId?.email || "N/A"}</TableCell>
                <TableCell>
                  {order.products
                    .map(
                      (p) => `${p.productId?.name || "N/A"} (x${p.quantity})`
                    )
                    .join(", ")}
                </TableCell>
                <TableCell>
                  {order.products.reduce((sum, p) => sum + p.quantity, 0)}
                </TableCell>
                <TableCell>₹{parseFloat(order.total).toFixed(2)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(order)}
                    variant="outlined"
                    color="primary"
                    disabled={loading}
                    sx={{ mr: 1 }}
                    aria-label={`Edit order ${order._id}`}
                  >
                    <Edit/>
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(order._id)}
                    variant="outlined"
                    color="error"
                    disabled={loading}
                    aria-label={`Delete order ${order._id}`}
                  >
                    <Delete/>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export default OrderManagement;