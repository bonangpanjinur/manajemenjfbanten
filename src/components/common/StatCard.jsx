import React from 'react';

export const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
        <div className={`stat-card-icon ${color}`}>
            {icon}
        </div>
        <div className="stat-card-info">
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);