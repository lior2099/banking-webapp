import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TransferDialog = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      clearForm();
    }
  }, [open]);

  const clearForm = () => {
    setToEmail('');
    setAmount('');
    setError(null);
  };

  const makeTransferRequest = async () => {
    const token = localStorage.getItem('Access_Token');
    const response = await axios.post(
      'http://localhost:3000/user/transaction',
      {
        to: toEmail,
        amount: parseFloat(amount)
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status === 200) {
      clearForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!toEmail || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await makeTransferRequest();
      onSuccess();
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            try {
              await refreshAccessToken();
              await makeTransferRequest();
              onSuccess();
            } catch (refreshError) {
              console.error('Refresh token error:', refreshError);
              setError('Session expired. Please log in again.');
              localStorage.removeItem('Access_Token');
              localStorage.removeItem('Refresh_Token');
              onClose();
              navigate('/');
            }
            break;
          case 409:
            setError('The user name cannot be found. Please try again.');
            break;
          case 400:
            setError('You do not have enough money to send.');
            break;
          default:
            setError(error.response.data?.msg || 'An error occurred while processing your transfer');
        }
      } else {
        setError('An error occurred while processing your transfer');
      }
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('Refresh_Token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshResponse = await axios.post('http://localhost:3000/user/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });

    localStorage.setItem('Access_Token', refreshResponse.data.Access_Token);
    localStorage.setItem('Refresh_Token', refreshResponse.data.Refresh_Token);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Transfer Money</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Recipient Email"
          type="email"
          fullWidth
          margin="normal"
          value={toEmail}
          onChange={(e) => {
            setError(null);
            setToEmail(e.target.value);
          }}
        />
        <TextField
          label="Amount ($)"
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => {
            setError(null);
            setAmount(e.target.value);
          }}
          inputProps={{
            min: 0,
            step: "0.01"
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="primary"
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog; 