// Home.js
import React, { useState } from "react";
import { Button, Box, Typography, Container, Dialog, DialogContent } from '@mui/material';
import LoginForm from './LoginForm.js';
import "./Home.css";
import { AppBar, Toolbar } from '@mui/material';

const Home = () => {
  // State to control the login dialog
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  // Function to open the login dialog
  const handleOpenLogin = () => {
    setOpenLoginDialog(true);
  };

  // Function to close the login dialog
  const handleCloseLogin = () => {
    setOpenLoginDialog(false);
  };

  return (
    <div className="login-container">
      <AppBar 
        position="fixed"
        sx={{ 
          backgroundColor: 'transparent',
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#1976d2',
              flexGrow: 1,
            }}
          >
            MO Bank
          </Typography>
          <Button 
            color="primary"
            variant="contained"
            href="/register"
            sx={{
              marginLeft: 2,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#2e7d32',
              }
            }}
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      <div className="background-image">
        <Container maxWidth="xs">
          <Box sx={{ paddingTop: '80px' }}> {/* Add padding for AppBar */}
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 4,
                mt: 4
              }}
            >
              Welcome to MO Bank
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 4
              }}
            >
              Swift, Secure, and Dedicated to Your Financial Well-being.
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleOpenLogin}
              fullWidth
            >
              Log In
            </Button>

            <Dialog
              open={openLoginDialog}
              onClose={handleCloseLogin}
              maxWidth="xs"
              fullWidth
            >
              <DialogContent>
                <LoginForm onClose={handleCloseLogin} />
              </DialogContent>
            </Dialog>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default Home;