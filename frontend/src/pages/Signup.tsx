import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api.js';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/auth/register',
        {
          name,
          email,
          password,
        },
      );

      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            'Unable to create account. Please try again.',
        );
      } else {
        setError('Unable to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand">
          <div className="signup-brand-mark">H</div>

          <div>
            <span className="signup-eyebrow">Healthcare Management</span>
            <h1>Create your account</h1>
          </div>
        </div>

        <p className="signup-subtitle">
          Register to access the healthcare management system.
        </p>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
            />

            <span className="password-hint">
              Must be at least 6 characters.
            </span>
          </div>

          {error && (
            <div className="signup-error">
              <span className="signup-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <span>Already have an account?</span>
          <button type="button" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        <div className="signup-footer">
          Healthcare Appointment Management System
        </div>
      </div>
    </div>
  );
}

export default Signup;