import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';
import './Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Login request
      const { data } = await axios.post('/api/auth/login', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 2. Verify response
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // 3. Check session
      const sessionRes = await axios.get('/api/auth/session', {
        withCredentials: true
      });

      if (!sessionRes.data.isAuthenticated) {
        throw new Error('Session verification failed');
      }

      // 4. Update state and redirect
      onLogin(sessionRes.data.user);
      //window.location.href = '/home'
      navigate('/home');

    } catch (err) {
      let message = 'Login failed';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && (
          <div className="alert alert-danger">
            {error}
            <button 
              className="btn btn-sm btn-outline-secondary mt-2 ms-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
  
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            autoComplete="username"
          />
        </div>
  
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            autoComplete="current-password"
            minLength="6"
          />
        </div>
  
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
  
        <div className="auth-footer mt-3">
          <Link to="/signup" className="text-primary">
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;