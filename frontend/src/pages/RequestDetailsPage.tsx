import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById } from '../api/requests.api';
import { decideRequest } from '../api/admin.api';
import { useAuth } from '../contexts/AuthContext';
import { RequestItem } from '../types';

const RequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');

  const isAdmin = user?.systemRole === 'admin' || user?.systemRole === 'superadmin';

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getRequestById(id);
        setRequest(data.request);
      } catch (err: any) {
        setError(err.message || 'Error loading request');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (!request) return;
    if (decision === 'REJECT' && !actionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      const data = await decideRequest({
        id: request._id,
        decision,
        rejectionReason: actionReason,
      });
      setRequest(data.request);
      setActionReason('');
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!request) return <div>Not Found</div>;

  return (
    <div>
      <h3>Request Details</h3>
      <div>
        <strong>ID:</strong> {request._id}
      </div>
      <div>
        <strong>Type:</strong> {request.type}
      </div>
      <div>
        <strong>Status:</strong> {request.status}
      </div>
      <div>
        <strong>Created At:</strong> {new Date(request.createdAt || '').toLocaleString()}
      </div>
      <hr />
      <div>
        <strong>Title:</strong> {request.title}
      </div>
      <div>
        <strong>Reason/Content:</strong>
        <p>{request.reason}</p>
      </div>

      {request.status === 'REJECTED' && (
        <div>
          <strong>Rejection Reason:</strong> {request.rejectionReason}
        </div>
      )}

      {isAdmin && request.status === 'OPEN' && (
        <div>
          <h4>Admin Actions</h4>
          <textarea placeholder="Rejection reason (required for rejection)" value={actionReason} onChange={(e) => setActionReason(e.target.value)} />
          <br />
          <button onClick={() => handleDecision('APPROVE')}>Approve</button>
          <button onClick={() => handleDecision('REJECT')}>Reject</button>
        </div>
      )}
      <br />
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default RequestDetailsPage;
