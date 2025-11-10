export const getTableColumns = (page, rowsPerPage, formatDateTime) => [
  { 
    id: 'index', 
    label: '#', 
    minWidth: 50,
    format: (value, index) => page * rowsPerPage + index + 1
  },
  { 
    id: 'from', 
    label: 'From', 
    minWidth: 170 
  },
  { 
    id: 'to', 
    label: 'To', 
    minWidth: 170 
  },
  { 
    id: 'money', 
    label: 'Amount', 
    minWidth: 100,
    format: (value) => `$${value.toLocaleString()}`
  },
  { 
    id: 'date', 
    label: 'Date & Time', 
    minWidth: 170,
    format: (value) => formatDateTime(value)
  }
]; 