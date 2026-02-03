import React, { useEffect, useState } from 'react';
import { getAdminRequests } from '../../api/admin.api';
import { listUsers } from '../../api/users.api';
import { RequestItem, REQUEST_TYPES, User } from '../../types';
import { RequestModal } from '../RequestModal';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'CLOSED' | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await listUsers();
      const map: Record<string, User> = {};
      data.users.forEach((u) => {
        map[u._id] = u;
      });
      setUsersMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const p = {
        page,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        userId: userFilter || undefined,
        type: typeFilter || undefined,
        date: dateFilter || undefined,
      };

      const data = await getAdminRequests(p);
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const onModalUpdate = () => {
    fetchRequests();
  };

  const getDisplayUser = (request: RequestItem) => {
    if (!request.createdBy) return 'Unknown';

    if (typeof request.createdBy === 'object' && 'name' in request.createdBy) {
      const u = request.createdBy as User;
      return `${u.name} (${u.bahadRole || 'No Role'})`;
    }

    const userId = request.createdBy as string;
    const user = usersMap[userId];

    if (user) {
      return `${user.name} (${user.bahadRole || 'No Role'})`;
    }

    return userId;
  };

  return (
    <div>
      <h2>Admin - All Requests</h2>

      <div>
        <div>
          <strong>Status: </strong>
          <button onClick={() => setStatusFilter('ALL')} disabled={statusFilter === 'ALL'}>
            All
          </button>
          <button onClick={() => setStatusFilter('OPEN')} disabled={statusFilter === 'OPEN'}>
            Open
          </button>
          <button onClick={() => setStatusFilter('CLOSED')} disabled={statusFilter === 'CLOSED'}>
            Closed
          </button>
        </div>

        <div>
          <strong>Type: </strong>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch}>
          <div>
            <label>Date:</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>

          <div>
            <label>User ID:</label>
            <input placeholder="Search by User ID" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
          </div>

          <button type="submit">Search</button>
        </form>
      </div>

      <hr />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User (Role)</th>
              <th>Type</th>
              <th>Status</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                <td>{getDisplayUser(r)}</td>
                <td>{r.type}</td>
                <td>{r.status}</td>
                <td>
                  <button onClick={() => setSelectedRequest(r)}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          {' '}
          Prev{' '}
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {selectedRequest && <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdate={onModalUpdate} />}
    </div>
  );
};

export default AdminRequestsPage;
