import React, { useState, useEffect, useContext } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getUsers, addUser, updateUser, deleteUser, getRoles } from '../api/api';
import { AuthContext } from '../context/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [editUser, setEditUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [roles, setRoles] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoading(true);
      Promise.all([getUsers(), getRoles()])
        .then(([usersRes, rolesRes]) => {
          setUsers(usersRes.data);
          setRoles(rolesRes.data);
        })
        .catch((err) => {
          console.error('Fetch error:', err);
          setSubmitError('Failed to fetch data');
          setRoles(['admin', 'user', 'manager', 'data-entry']); // Fallback
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.email || data.email.trim() === '') newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!editUser && (!data.password || data.password.trim().length < 6))
      newErrors.password = 'Password must be at least 6 characters';
    if (!roles.includes(data.role)) newErrors.role = `Role must be one of: ${roles.join(', ')}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const userData = {
      email: form.email.trim(),
      password: form.password.trim(),
      role: form.role
    };
    console.log('Submitting user data:', userData);
    if (!validateForm(userData)) {
      console.log('Validation errors:', errors);
      return;
    }
    setLoading(true);
    try {
      const response = await addUser(userData);
      console.log('Add user response:', response.data);
      setForm({ email: '', password: '', role: 'user' });
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add user';
      setSubmitError(errorMessage);
      console.error('Add user error:', err, 'Response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ email: user.email, password: '', role: user.role });
    setErrors({});
    setSubmitError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const updateData = {
      email: form.email.trim(),
      role: form.role,
    };
    if (form.password.trim()) {
      updateData.password = form.password.trim();
    }
    console.log('Updating user data:', updateData);
    if (!validateForm({ ...updateData, password: updateData.password || 'dummy' })) {
      console.log('Validation errors:', errors);
      return;
    }
    setLoading(true);
    try {
      const response = await updateUser(editUser._id, updateData);
      console.log('Update user response:', response.data);
      setEditUser(null);
      setForm({ email: '', password: '', role: 'user' });
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user';
      setSubmitError(errorMessage);
      console.error('Update user error:', err, 'Response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteUser(id);
      console.log('Delete user response:', response.data);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setSubmitError(errorMessage);
      console.error('Delete user error:', err, 'Response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Please log in to manage users
        </Typography>
        <Typography variant="body1">
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline' }}>
            Click here to log in
          </Link>
        </Typography>
      </Box>
    );
  }

  if (user?.role !== 'admin' || 'manager') {
    return <Typography variant="h6">Access Denied</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ flex: '1 1 200px' }}
          required
          aria-required="true"
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={!!errors.password}
          helperText={errors.password}
          sx={{ flex: '1 1 200px' }}
          required={!editUser}
          aria-required={!editUser}
        />
        <FormControl sx={{ flex: '1 1 200px' }} error={!!errors.role}>
          <InputLabel>Role</InputLabel>
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            label="Role"
            required
            aria-required="true"
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </Select>
          {errors.role && <Typography color="error" variant="caption">{errors.role}</Typography>}
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading} sx={{ alignSelf: 'flex-start' }}>
          {loading ? <CircularProgress size={24} /> : 'Add User'}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(user)}
                    color="primary"
                    aria-label={`Edit user ${user.email}`}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user._id)}
                    color="error"
                    aria-label={`Delete user ${user.email}`}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUpdate} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
              aria-required="true"
            />
            <TextField
              label="Password (optional)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password || 'Leave blank to keep current password'}
              fullWidth
            />
            <FormControl error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                label="Role"
                required
                aria-required="true"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <Typography color="error" variant="caption">{errors.role}</Typography>}
            </FormControl>
            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)} aria-label="Cancel edit">Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={loading}
            aria-label="Save user changes"
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;