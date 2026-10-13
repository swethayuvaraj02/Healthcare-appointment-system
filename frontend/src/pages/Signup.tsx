import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login } from '../services/authService';
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

    const trimmedName = name.trim();
    const nameParts = trimmedName.split(/\s+/);

    if (!trimmedName || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (nameParts.length < 2) {
      setError('Please enter your full name, including your first and last name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
  `${import.meta.env.VITE_API_URL}/auth/register`,
  {
    name: trimmedName,
    email: email.trim(),
    password,
  },
);

const data = await login({
  email: email.trim(),
  password,
});

localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('user', JSON.stringify(data.user));

navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);

if (axios.isAxiosError(error)) {
  console.error('Request URL:', error.config?.url);
  console.error('Response status:', error.response?.status);
  console.error('Response data:', error.response?.data);
  console.error('Error message:', error.message);
}

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        setError(
          Array.isArray(message)
            ? message.join(' ')
            : message || 'Unable to create account. Please try again.',
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
              placeholder="Enter your full name"
              autoComplete="name"
              required
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
              required
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
              minLength={6}
              required
            />
            <span className="password-hint">
              Must be at least 6 characters.
            </span>
          </div>

          {error && (
            <div className="signup-error" role="alert">
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
