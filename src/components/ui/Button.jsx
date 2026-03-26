import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, loadingText = '', disabled, ...props }) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${className} ${loading ? 'btn-loading' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn-content">
                    <span className="btn-spinner"></span>
                    {loadingText || children}
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
