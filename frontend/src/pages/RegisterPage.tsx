import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { register } from '../api/auth.api';

const RegisterPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bahadRole, setBahadRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const data = await register({
        name,
        personalNumber,
        email,
        password,
        bahadRole,
      });
      setAuth(data.token, data.user);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Personal Number: </label>
          <input value={personalNumber} onChange={(e) => setPersonalNumber(e.target.value)} required />
        </div>
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Bahad Role (e.g. Cadet, Commander): </label>
          <input value={bahadRole} onChange={(e) => setBahadRole(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <div>{error}</div>}
    </div>
  );
};

export default RegisterPage;
