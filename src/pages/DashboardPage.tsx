import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>Welcome to Focus Lock</h1>
      <div className="dashboard-links">
        <Link to="/timer" className="dashboard-link">
          Start Focus Timer
        </Link>
        <Link to="/stats" className="dashboard-link">
          View Statistics
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage; 