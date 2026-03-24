import React from 'react';
import './BaseLayout.css';

const BaseLayout = ({ children }) => {
    return (
        <div className="base-layout">
            {children}
        </div>
    );
};

export default BaseLayout;
