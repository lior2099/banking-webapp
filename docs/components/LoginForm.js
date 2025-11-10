// LoginForm.js
import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, TextField, Alert, IconButton, InputAdornment } from '@mui/material';
import validator from 'validator';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const LoginForm = ({ onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    if (!validator.isEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/log-in', {
        email,
        password
      });

      if (response.status === 200) {
        // Store tokens
        localStorage.setItem('Access_Token', response.data.Access_Token);
        localStorage.setItem('Refresh_Token', response.data.Refresh_Token);
        
        // Close the login modal if it exists
        if (onClose) {
          onClose();
        }

        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Login failed - Wrong Email or Password');
      } else if (error.request) {
        setErrorMessage('No response from server. Please check your connection.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
      console.error('Login error:', error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };


  return (
    <Box className="login-form">
      <Typography variant="h5" component="h2" gutterBottom>
        Login
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Log In
        </Button>
      </form>
    </Box>
  );
};

export default LoginForm;