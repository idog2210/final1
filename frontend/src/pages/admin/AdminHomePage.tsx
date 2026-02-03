import React from 'react';
import { Link } from 'react-router-dom';

const AdminHomePage = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <ul>
        <li>
          <Link to="/admin/requests">Manage Requests</Link>
        </li>
        <li>
          <Link to="/admin/users">Manage Users</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminHomePage;
