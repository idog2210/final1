import React, { useEffect, useState } from 'react';
import { getMyRequests } from '../api/requests.api';
import { RequestItem, RequestStatus } from '../types';
import { RequestModal } from './RequestModal';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyRequests('ALL');
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div>
      <h2>My Requests</h2>
      <div>
        <label>Filter Status: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="ALL">All</option>
          <option value="OPEN">Open</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <br />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r) => (
              <tr key={r._id}>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                <td>{r.type}</td>
                <td>{r.title}</td>
                <td>{r.status}</td>
                <td>
                  <button onClick={() => setSelectedRequest(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRequest && <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </div>
  );
};

export default MyRequestsPage;
