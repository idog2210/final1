import React, { useState } from 'react';
import { decideRequest } from '../api/admin.api';
import { useAuth } from '../contexts/AuthContext';
import { RequestItem } from '../types';

type RequestModalProps = {
  request: RequestItem;
  onClose: () => void;
  onUpdate?: () => void;
};

export const RequestModal: React.FC<RequestModalProps> = ({ request, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [actionReason, setActionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.systemRole === 'admin' || user?.systemRole === 'superadmin';

  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'REJECT' && !actionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    try {
      await decideRequest({
        id: request._id,
        decision,
        rejectionReason: actionReason,
      });
      if (onUpdate) onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
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
          <strong>Date:</strong> {new Date(request.createdAt || '').toLocaleString()}
        </div>
        <hr />
        <div>
          <strong>Title:</strong> {request.title}
        </div>
        <div>
          <strong>Reason:</strong>
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
            <div>
              <button disabled={loading} onClick={() => handleDecision('APPROVE')}>
                Approve
              </button>
              <button disabled={loading} onClick={() => handleDecision('REJECT')}>
                Reject
              </button>
            </div>
          </div>
        )}

        <div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
