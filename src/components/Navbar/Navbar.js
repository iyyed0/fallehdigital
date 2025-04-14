import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import './Navbar.css';

const Navbar = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      if (onLogout) onLogout();
      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <h1 className="logo">FarmDigital</h1>
        
        <div className="links-container">
          <Link to="/home">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/commandes">Orders</Link>
          <Link to="/JobOffers">Job Offers</Link>
          <Link to="/map">Map</Link>
          <Link to="/Blog">Blog</Link>
        </div>

        {currentUser && (
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;