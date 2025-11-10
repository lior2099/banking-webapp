import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { formatDateTime } from '../utils/formatters.js';

const TransactionsTable = ({ transactions }) => {
  const userEmail = localStorage.getItem('user_email');

  const columns = [
    { 
      field: 'id', 
      headerName: '#', 
      width: 70,
    },
    { 
      field: 'from', 
      headerName: 'From', 
      width: 200,
      flex: 1
    },
    { 
      field: 'to', 
      headerName: 'To', 
      width: 200,
      flex: 1
    },
    { 
      field: 'money',
      headerName: 'Amount', 
      width: 130,
      flex: 1,
      valueFormatter: (params) => {
        if (params != null) {
          return `$${Number(params).toLocaleString()}`;
        }
        return '';
      },
      cellClassName: (params) => {
        if (params.row && params.row.from === userEmail) {
          return 'amount-red';
        }
        return 'amount-green';
      }
    },
    { 
      field: 'date',
      headerName: 'Date & Time', 
      width: 200,
      flex: 1,
      valueFormatter: (params) => {
        if (params) {
          return formatDateTime(params);
        }
        return '';
      }
    }
  ];

  const rows = transactions.map((transaction, index) => ({
    ...transaction,
    id: index, 
  }));

  return (
    <Paper className="table-container" >
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          sorting: {
            sortModel: [{ field: 'date', sort: 'desc' }],
          },
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '1rem',
            padding: '8px 16px',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '1.1rem',
            fontWeight: 600,
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '& .amount-green': {
            color: 'green',
            fontWeight: 'bold'
          },
          '& .amount-red': {
            color: 'red',
            fontWeight: 'bold'
          },
          border: 'none',
        }}
      />
    </Paper>
  );
};

export default TransactionsTable; 