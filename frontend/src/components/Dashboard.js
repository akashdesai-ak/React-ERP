import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Typography, Box, Grid, Paper, Zoom, Avatar, CircularProgress } from '@mui/material';
import { Inventory, People, ShoppingCart } from '@mui/icons-material';
import { getProducts, getUsers, getOrders } from '../api/api';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;
    setLoading(true);
    try {
      const [products, users, orders] = await Promise.all([
        getProducts(),
        getUsers(),
        getOrders(),
      ]);
      setStats({
        products: products.data.length,
        users: users.data.length,
        orders: orders.data.length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStats]);

  const statsData = [
    { title: 'Products', value: stats.products, icon: <Inventory />, color: '#1976d2' },
    { title: 'Users', value: stats.users, icon: <People />, color: '#388e3c' },
    { title: 'Orders', value: stats.orders, icon: <ShoppingCart />, color: '#d81b60' },
  ];

  return (
    <Box sx={{ mt: 4 }} >
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {authLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : user ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {user.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Logged in as: {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography color="error">User not logged in</Typography>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={4} key={stat.title}>
              <Zoom in timeout={300 * (index + 1)}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    backgroundColor: stat.color,
                    color: '#fff',
                    borderRadius: 2,
                    boxShadow: 3,
                    width: 100,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  {stat.icon}
                  <Box>
                    <Typography variant="h6">{stat.title}</Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;