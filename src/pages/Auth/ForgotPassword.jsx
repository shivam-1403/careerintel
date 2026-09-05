import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import './Auth.css';
import API_BASE from '../../config/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            // Success state
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Server error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <ThemeToggle className="auth-theme-toggle" />
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="brand" onClick={() => navigate('/')}>
                        <div className="brand-logo">CI</div>
                        <span className="brand-name">CareerIntel</span>
                    </div>
                </div>

                {!success ? (
                    <>
                        <div className="auth-header" style={{ marginTop: '0', paddingBottom: '1.5rem' }}>
                            <h2 className="auth-title">Forgot Password?</h2>
                            <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                loading={loading}
                                loadingText="Sending Link..."
                            >
                                Send Reset Link
                            </Button>

                            <button type="button" className="btn btn-ghost w-full" onClick={() => navigate('/login')}>
                                <ArrowLeft size={18} /> Back to Login
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="auth-success-state" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                <MailCheck size={32} />
                            </div>
                        </div>
                        <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Check your email</h2>
                        <p className="auth-subtitle" style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                            If an account exists with <strong>{email}</strong>, a secure reset link has been sent.
                        </p>
                        <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
                            Back to Login
                        </Button>
                    </div>
                )}
            </div>
            <div className="auth-background"></div>
        </div>
    );
};

export default ForgotPassword;
