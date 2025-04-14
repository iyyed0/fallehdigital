import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from './axiosConfig';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Commandes from "./pages/Commandes";
import JobOffers from "./pages/JobOffers";
import Map from "./pages/Map";
import Products from "./pages/Products";
import Navbar from './components/Navbar/Navbar';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    checked: false
  });
  const location = useLocation();

  const checkAuth = async () => {
    try {
      const { data } = await axios.get('/api/auth/session', { 
        withCredentials: true 
      });
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        user: data.user || null,
        checked: true
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        checked: true
      });
    }
  };

  const handleLogin = async (userData) => {
    await checkAuth();
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        checked: true
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (!authState.checked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const showNavbar = !['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar currentUser={authState.user} onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/login" 
          element={
            !authState.isAuthenticated ? 
              <Login onLogin={handleLogin} /> : 
              <Navigate to="/home" replace state={{ from: location }} />
          } 
        />
        <Route 
          path="/signup" 
          element={
            !authState.isAuthenticated ? 
              <Signup onSignup={handleLogin} /> :
              <Navigate to="/home" replace />
          } 
        />
        <Route 
          path="/home" 
          element={
            authState.isAuthenticated ? 
              <Home user={authState.user} /> : 
              <Navigate to="/login" replace state={{ from: location }} />
          } 
        />
        <Route 
          path="/JobOffers" 
          element={
            authState.isAuthenticated ? 
              <JobOffers user={authState.user} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/blog" 
          element={
            authState.isAuthenticated ? 
              <Blog user={authState.user} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/commandes" 
          element={
            authState.isAuthenticated ? 
              <Commandes user={authState.user} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/map" 
          element={
            authState.isAuthenticated ? 
              <Map user={authState.user} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/products" 
          element={
            authState.isAuthenticated ? 
              <Products user={authState.user} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="*" 
          element={
            <Navigate to={authState.isAuthenticated ? "/home" : "/login"} replace />
          } 
        />
      </Routes>
    </>
  );
}

export default App;