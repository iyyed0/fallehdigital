import React from 'react';
import './Stats.css';

const Stats = () => {
  const statsData = [
    { value: '3,233', label: 'Our Experience' },
    { value: '2,224', label: 'Farm Specialist' },
    { value: '323', label: 'Complete Projects' },
    { value: '100', label: 'Happy Clients' }
  ];

  return (
    <div className="stats-container">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Stats;