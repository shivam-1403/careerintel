import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import PasswordInput from '../../components/ui/PasswordInput';
import './Auth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("https://careerintel-w10f.onrender.com/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    new_password: newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Failed to reset password. The link might be expired.");
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
                            <h2 className="auth-title">Reset Password</h2>
                            <p className="auth-subtitle">Enter your new secure password below.</p>
                        </div>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>New Password</label>
                                <PasswordInput
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full mt-2"
                                loading={loading}
                                loadingText="Resetting..."
                                disabled={loading || !token}
                            >
                                Update Password
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="auth-success-state" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                <CheckCircle size={32} />
                            </div>
                        </div>
                        <h2 className="auth-title" style={{ marginBottom: '0.5rem' }}>Password Updated!</h2>
                        <p className="auth-subtitle" style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                            Your password has been successfully reset. You can now use your new password to log in.
                        </p>
                        <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
                            Login Now
                        </Button>
                    </div>
                )}
            </div>
            <div className="auth-background"></div>
        </div>
    );
};

export default ResetPassword;
