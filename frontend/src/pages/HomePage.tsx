import React from 'react';
import { Link } from 'react-router-dom';
import { REQUEST_TYPES } from '../types';

const HomePage = () => {
  return (
    <div>
      <h2>Home</h2>
      <div>Choose request type:</div>
      <ul>
        {REQUEST_TYPES.map((t) => (
          <li key={t}>
            <Link to={`/type/${t}/new/requests`}>{t}</Link>
          </li>
        ))}
      </ul>
      <div>
        <Link to="/requests/me">Go to My Requests</Link>
      </div>
    </div>
  );
};

export default HomePage;
