import React from "react";
import { Box, Typography, Container, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import pageNotFoundImage from '../pics/pageNotFound.jpeg';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundImage: `url(${pageNotFoundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '20px'
      }}>
        <Container maxWidth="xs">
          <Box 
            sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: 4,
              borderRadius: 2,
              boxShadow: 1,
              marginTop: 4
            }}
          >
            <Typography variant="h3" sx={{ mb: 2 }}>
              404 Page Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              The requested URL <strong>{location.pathname}</strong> was not found on this server. That's all we know.
            </Typography>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default NotFound; 