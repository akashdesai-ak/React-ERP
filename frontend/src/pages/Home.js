import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 60,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center' }}>
          {open && (
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ERP System
            </Typography>
          )}
          <IconButton onClick={toggleDrawer} aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        {open && user && (
          <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
              {user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
          </Box>
        )}
        <Divider />
        <List>
          {[
            { text: 'Dashboard', icon: <DashboardIcon />, to: '/home/dashboard' },
            { text: 'Products', icon: <InventoryIcon />, to: '/home/products' },
            ...(user?.role === 'admin' ? [{ text: 'Users', icon: <PeopleIcon />, to: '/home/users' }] : []),
            { text: 'Orders', icon: <ShoppingCartIcon />, to: '/home/orders' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  '&.active': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  },
                }}
                aria-label={`Navigate to ${item.text}`}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} aria-label="Log out">
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 60}px)` },
          ml: { sm: `${open ? drawerWidth : 60}px` },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Home;