import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { token, user, logout } = useAuth();

  return (
    <div>
      <div>
        <b>Requests Platform</b>
      </div>

      <div>
        {token ? (
          <>
            <span>Logged in as: {user ? `${user.name} (${user.systemRole})` : '...'}</span>
            {' | '}
            <Link to="/home">Home</Link>
            {' | '}
            <Link to="/requests/me">My Requests</Link>
            {' | '}
            <Link to="/profile">Profile</Link>
            {' | '}
            <button onClick={logout}>Logout</button>

            {user && (user.systemRole === 'admin' || user.systemRole === 'superadmin') ? (
              <>
                {' | '}
                <Link to="/admin">Admin</Link>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            {' | '}
            <Link to="/register">Register</Link>
          </>
        )}
      </div>

      <hr />

      <Outlet />
    </div>
  );
};

export default App;
