import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../api/api";
import { AuthContext } from "../context/AuthContext";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [editProduct, setEditProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      setSubmitError("Failed to fetch products");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name || data.name.trim() === "")
      newErrors.name = "Product name is required";
    if (isNaN(data.price) || data.price <= 0)
      newErrors.price = "Price must be a positive number";
    if (isNaN(data.quantity) || data.quantity < 0)
      newErrors.quantity = "Quantity must be a non-negative number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!user?.userId) {
      setSubmitError("You must be logged in to create a product");
      return;
    }
    if (!['admin', 'manager'].includes(user.role)) {
      setSubmitError("Only admins and managers can create products");
      return;
    }
    const formData = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };
    if (!validateForm(formData)) return;
    setLoading(true);
    try {
      await addProduct(formData);
      setForm({ name: "", price: "", quantity: "" });
      await fetchProducts();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to add product");
      console.error("Add product error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    setErrors({});
    setSubmitError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!user || !['admin', 'manager'].includes(user.role)) {
      setSubmitError("Only admins and managers can update products");
      return;
    }
    const formData = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };
    if (!validateForm(formData)) return;
    setLoading(true);
    try {
      await updateProduct(editProduct._id, formData);
      setEditProduct(null);
      setForm({ name: "", price: "", quantity: "" });
      await fetchProducts();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update product");
      console.error("Update product error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        setSubmitError("Only admins and managers can delete products");
        return;
      }
      await deleteProduct(deleteConfirm._id);
      setDeleteConfirm(null);
      await fetchProducts();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to delete product");
      console.error("Delete product error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Please log in to view products
        </Typography>
        <Typography variant="body1">
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>
            Click here to log in
          </Link>
        </Typography>
      </Box>
    );
  }

  const isAdminOrManager = ['admin', 'manager'].includes(user.role);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      {isAdminOrManager && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}
        >
          <TextField
            label="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ flex: "1 1 200px" }}
            required
            aria-required="true"
          />
          <TextField
            label="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            error={!!errors.price}
            helperText={errors.price}
            sx={{ flex: "1 1 200px" }}
            required
            aria-required="true"
          />
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
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ alignSelf: "flex-start" }}
            aria-label="Add product"
          >
            {loading ? <CircularProgress size={24} /> : "Add Product"}
          </Button>
        </Box>
      )}
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
              }}
            >
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              {isAdminOrManager && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product._id}
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}
              >
                <TableCell>{product.name}</TableCell>
                <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                {isAdminOrManager && (
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(product)}
                      color="primary"
                      aria-label={`Edit product ${product.name}`}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteConfirm(product)}
                      color="error"
                      aria-label={`Delete product ${product.name}`}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Product Modal */}
      {isAdminOrManager && (
        <Dialog
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              onSubmit={handleUpdate}
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
                aria-required="true"
              />
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
                required
                aria-required="true"
              />
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                error={!!errors.quantity}
                helperText={errors.quantity}
                fullWidth
                required
                aria-required="true"
              />
              {submitError && <Alert severity="error">{submitError}</Alert>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditProduct(null)} aria-label="Cancel edit">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={loading}
              aria-label="Save product changes"
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isAdminOrManager && (
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the product "{deleteConfirm?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirm(null)}
              aria-label="Cancel delete"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={loading}
              aria-label="Confirm delete"
            >
              {loading ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default ProductManagement;