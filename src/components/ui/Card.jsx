import React from 'react';
import './Card.css';

const Card = ({ children, className = '', title, subtitle, headerAction, style }) => {
    return (
        <div className={`card ${className}`} style={style}>
            {(title || subtitle || headerAction) && (
                <div className="card-header">
                    <div>
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="card-action">{headerAction}</div>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};

export default Card;
