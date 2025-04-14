import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    countryCode: '+216',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const countryCodes = [
    { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+1', name: 'USA', flag: '🇺🇸' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
  ];

  // Auto-generate username when names change
  useEffect(() => {
    const cleanFirstName = formData.firstName.toLowerCase().replace(/\s+/g, '');
    const cleanLastName = formData.lastName.toLowerCase().replace(/\s+/g, '');
    const generatedUsername = `${cleanFirstName}${cleanLastName}`;
    
    setFormData(prev => ({
      ...prev,
      username: generatedUsername
    }));
  }, [formData.firstName, formData.lastName]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      countryCode: e.target.value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d+$/.test(formData.phone)) newErrors.phone = 'Phone number must contain only digits';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (passwordStrength < 3) newErrors.password = 'Password too weak';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: fullPhone,
          country_code: formData.countryCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('User created successfully:', data);
      navigate('/login', { state: { registrationSuccess: true } });
      
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return 'transparent';
      case 1: return '#ff4d4d';
      case 2: return '#ffa64d';
      case 3: return '#66cc66';
      case 4: return '#339933';
      default: return 'transparent';
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Create Your Farmer Account</h2>
        
        {submitError && <div className="error-message">{submitError}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error-input' : ''}
              required
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error-input' : ''}
              required
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'error-input' : ''}
            required
          />
          <small className="hint">Generated from your name (editable)</small>
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="phone-input-group">
            <select 
              value={formData.countryCode}
              onChange={handleCountryChange}
              className="country-select"
            >
              {countryCodes.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`phone-input ${errors.phone ? 'error-input' : ''}`}
              placeholder="12345678"
              required
            />
          </div>
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error-input' : ''}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error-input' : ''}
              required
            />
            <div className="password-strength-meter">
              <div 
                className="strength-bar" 
                style={{
                  width: `${passwordStrength * 25}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              />
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error-input' : ''}
              required
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Creating Account...
            </>
          ) : 'Create Account'}
        </button>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <a href="/login">Sign In</a>
        </div>
      </form>
    </div>
  );
}