import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="brand" onClick={() => navigate('/')}>
                        <div className="brand-logo">CI</div>
                        <span className="brand-name">CareerIntel</span>
                    </div>
                    <h2 className="auth-title">Forgot Password?</h2>
                    <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>
                </div>

                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); }}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="john@example.com" required />
                    </div>

                    <Button type="submit" size="lg" className="w-full">Reset Password</Button>

                    <button className="btn btn-ghost w-full" onClick={() => navigate('/login')}>
                        <ArrowLeft size={18} /> Back to Login
                    </button>
                </form>
            </div>
            <div className="auth-background"></div>
        </div>
    );
};

export default ForgotPassword;
