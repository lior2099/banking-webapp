import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
  Container, 
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DashBoard.css';
import TransferDialog from './TransferDialog.js';
import TransactionsTable from './TransactionsTable.js';

const DashBoard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('Access_Token');
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get('http://localhost:3000/user/user-info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData(response.data.user_info);
      localStorage.setItem('user_email', response.data.user_info.user_id);
      localStorage.setItem('Access_Token', response.data.Access_Token);
      setLoading(false);
    } catch (error) {
      handleError(error);
    }
  }, [navigate]);

  const handleError = (error) => {
    if (error.response?.status === 401) {
      handleTokenRefresh();
    } else {
      setError('Failed to load user data');
      setLoading(false);
      console.error('Error fetching user data:', error);
      clearTokensAndRedirect();
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('Refresh_Token');
      if (!refreshToken) {
        navigate('/');
        return;
      }

      const refreshResponse = await axios.post('http://localhost:3000/user/refresh', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
      });

      localStorage.setItem('Access_Token', refreshResponse.data.Access_Token);
      localStorage.setItem('Refresh_Token', refreshResponse.data.Refresh_Token);
      fetchUserData();
    } catch (refreshError) {
      console.error('Refresh token error:', refreshError);
      clearTokensAndRedirect();
    }
  };

  const clearTokensAndRedirect = () => {
    localStorage.removeItem('Access_Token');
    localStorage.removeItem('Refresh_Token');
    navigate('/');
  };

  const handleTransferSuccess = async () => {
    setTransferDialogOpen(false);
    await fetchUserData();
  };

  const handleLogout = () => {
    clearTokensAndRedirect();
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'absolute',
          top: 20,
          right: 40,
          zIndex: 1000
        }}>
          <Button 
            size="large"
            variant="contained" 
            color="secondary" 
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </Box>
        <BankLogo />
        <WelcomeMessage userData={userData} />
        <BalanceSection 
          balance={userData?.balance} 
          onTransferClick={() => setTransferDialogOpen(true)} 
        />
        
        <TransactionsTable
          transactions={userData?.transactions || []}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />

        <TransferDialog
          open={transferDialogOpen}
          onClose={() => setTransferDialogOpen(false)}
          onSuccess={handleTransferSuccess}
        />
      </Container>
    </div>
  );
};

// Smaller components
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const ErrorMessage = ({ message }) => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <Typography color="error">{message}</Typography>
  </Box>
);

const BankLogo = () => (
  <Box sx={{ 
    position: 'absolute', 
    top: 20, 
    left: 20,
    padding: '10px',
    borderRadius: '10px'
  }}>
    <Typography variant="h2" className="bank-logo">
      MO BANK
    </Typography>
  </Box>
);

const WelcomeMessage = ({ userData }) => (
  <Box className="welcome-message">
    <Typography variant="h3" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,1.5)' }}>
      Welcome {userData?.first_name} {userData?.last_name} to your account
    </Typography>
  </Box>
);

const BalanceSection = ({ balance, onTransferClick }) => (
  <Box className="balance-section">
    <Typography variant="h5">
      Current Balance: ${balance?.toLocaleString()}
    </Typography>
    <Button 
      variant="contained" 
      color="primary"
      onClick={onTransferClick}
    >
      Transfer Money
    </Button>
  </Box>
);

export default DashBoard; 