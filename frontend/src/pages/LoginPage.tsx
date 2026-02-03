import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../api/auth.api';

const LoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const data = await login({ email, password });
      setAuth(data.token, data.user);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div>{error}</div>}
        <button type="submit">Login</button>
      </form>
      <div>
        <Link to="/register">Don't have an account? Register</Link>
      </div>
      <div>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;
