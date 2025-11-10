// App.js
import React from 'react';
import './App.css';
import Home from './components/Home.js';
import Register from './components/Register.js';
import DashBoard from './components/DashBoard.js';
import NotFound from './components/NotFound.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;