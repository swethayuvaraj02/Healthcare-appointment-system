import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const data = await login({
        email,
        password,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">H</div>

          <div>
            <span className="login-eyebrow">Healthcare Management</span>
            <h1>Welcome back</h1>
          </div>
        </div>

        <p className="login-subtitle">
          Sign in to access your healthcare management dashboard.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

       <div className="signup-link">
          <span>Don't have an account?</span>
          <button type="button" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>

        <div className="login-footer">
          <span>Healthcare Appointment Management System</span>
        </div>
      </div>
    </div>
  );
}

export default Login;