import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api/auth.api';

const ForgotPasswordPage = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      const devToken = (res as any)?.devResetToken;
      if (devToken) {
        setToken(devToken);
        setOk('Reset token generated(for dev use). Please enter new password below.');
      } else {
        setOk((res as any)?.message || 'If the email exists, a reset link has been sent.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setOk('Password updated. You can login now.');
      nav('/login');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={onRequest}>
        <div>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button disabled={loading} type="submit">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <hr />
      <h3>New Password</h3>
      <form onSubmit={onReset}>
        <div>
          <label>New Password</label>
          <br />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div>
          <label>Confirm New Password</label>
          <br />
          <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
        </div>
        <button disabled={loading} type="submit">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
      {ok ? <div>{ok}</div> : null}
      {error ? <div>{error}</div> : null}
      <div>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
