import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createRequest } from '../api/requests.api';
import { RequestType } from '../types';

const NewRequestPage = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    try {
      setLoading(true);
      setError(null);
      await createRequest({
        type: type as RequestType,
        title,
        reason,
      });
      navigate('/requests/me');
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>New Request: {type}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <br />
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Reason / Details</label>
          <br />
          <textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>
        <button disabled={loading} type="submit">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      {error && <div>{error}</div>}
    </div>
  );
};

export default NewRequestPage;
