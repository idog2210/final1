import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../api/users.api';
import { User } from '../types';

const UserProfileByIdPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data.user);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>User Profile: {user.name}</h2>
      <ul>
        <li>Email: {user.email}</li>
        <li>Personal Number: {user.personalNumber}</li>
        <li>System Role: {user.systemRole}</li>
        <li>Bahad Role: {user.bahadRole}</li>
        <li>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</li>
      </ul>
    </div>
  );
};

export default UserProfileByIdPage;
