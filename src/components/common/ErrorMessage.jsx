import React from 'react';

export const ErrorMessage = ({ message }) => (
    <div style={{ color: 'var(--danger)', padding: '20px', border: '1px solid var(--danger)', borderRadius: '6px' }}>
        <strong>Error:</strong> {message}
    </div>
);