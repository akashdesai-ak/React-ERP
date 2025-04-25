import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} aria-hidden="true" />
      <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem' }, fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/home/dashboard')}
        sx={{ px: 4, py: 1.5 }}
        aria-label="Return to dashboard"
      >
        Back to Dashboard
      </Button>
    </Container>
  );
}

export default NotFound;