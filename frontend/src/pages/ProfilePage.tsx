import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateMe, changeMyPassword } from '../api/users.api';

const ProfilePage = () => {
  const { user, refreshMe } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bahadRole, setBahadRole] = useState(user?.bahadRole || '');
  const [msg, setMsg] = useState('');

  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      await updateMe({ name, bahadRole });
      await refreshMe();
      setMsg('Profile updated successfully');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    try {
      await changeMyPassword({ currentPassword: currPass, newPassword: newPass });
      setPassMsg('Password changed successfully');
      setCurrPass('');
      setNewPass('');
    } catch (err: any) {
      setPassMsg(err.message || 'Failed to change password');
    }
  };

  return (
    <div>
      <h2>My Profile</h2>
      <div>
        <strong>Email:</strong> {user?.email}
      </div>
      <div>
        <strong>System Role:</strong> {user?.systemRole}
      </div>
      <div>
        <strong>Personal Number:</strong> {user?.personalNumber}
      </div>

      <hr />
      <h3>Edit Info</h3>
      <form onSubmit={handleUpdateInfo}>
        <div>
          <label>Name: </label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>Bahad Role: </label>
          <input value={bahadRole} onChange={(e) => setBahadRole(e.target.value)} />
        </div>
        <button type="submit">Update Info</button>
      </form>
      {msg && <div>{msg}</div>}

      <hr />
      <h3>Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <div>
          <label>Current Password: </label>
          <input type="password" value={currPass} onChange={(e) => setCurrPass(e.target.value)} />
        </div>
        <div>
          <label>New Password: </label>
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        </div>
        <button type="submit">Change Password</button>
      </form>
      {passMsg && <div>{passMsg}</div>}
    </div>
  );
};

export default ProfilePage;
