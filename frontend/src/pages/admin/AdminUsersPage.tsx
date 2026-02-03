import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, updateUserById } from '../../api/users.api';
import { adminUpdateUser } from '../../api/admin.api';
import { User, SystemRole } from '../../types';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    name: string;
    bahadRole: string;
    systemRole: SystemRole;
  }>({ name: '', bahadRole: '', systemRole: 'user' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u: User) => {
    setEditingId(u._id);
    setEditForm({
      name: u.name,
      bahadRole: u.bahadRole,
      systemRole: u.systemRole,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await adminUpdateUser({
        id: editingId,
        ...editForm,
      });
      setEditingId(null);
      loadUsers();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  return (
    <div>
      <h2>Manage Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border={1} cellPadding={5} width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>P. Number</th>
              <th>Role</th>
              <th>System Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = u._id === editingId;
              return (
                <tr key={u._id}>
                  <td>{isEditing ? <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /> : u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.personalNumber}</td>
                  <td>{isEditing ? <input value={editForm.bahadRole} onChange={(e) => setEditForm({ ...editForm, bahadRole: e.target.value })} /> : u.bahadRole}</td>
                  <td>
                    {isEditing ? (
                      <select value={editForm.systemRole} onChange={(e) => setEditForm({ ...editForm, systemRole: e.target.value as SystemRole })}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    ) : (
                      u.systemRole
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)}>Edit</button>
                        {' | '}
                        <Link to={`/users/${u._id}/profile`}>View</Link>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsersPage;
