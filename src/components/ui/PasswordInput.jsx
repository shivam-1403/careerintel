import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
    value,
    onChange,
    placeholder = '••••••••',
    required = true,
    id,
    name,
    autoComplete,
    onFocus,
    onBlur
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePassword();
        }
    };

    return (
        <div className="password-input-wrapper">
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                id={id}
                name={name}
                autoComplete={autoComplete}
                onFocus={onFocus}
                onBlur={onBlur}
                className="password-input"
            />
            <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                onKeyDown={handleKeyDown}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
            >
                {showPassword ? (
                    <EyeOff className="password-icon" />
                ) : (
                    <Eye className="password-icon" />
                )}
            </button>
        </div>
    );
};

export default PasswordInput;