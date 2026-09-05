import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PasswordInput from '../../components/ui/PasswordInput';
import ThemeToggle from '../../components/ui/ThemeToggle';
import './Auth.css';
import API_BASE from '../../config/api';

const Signup = () => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Signup failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.access_token);
            navigate("/dashboard");

        } catch (err) {
            setError("Server error");
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
                    <h2 className="auth-title">Create an Account</h2>
                    <p className="auth-subtitle">Join thousands of students building their futures.</p>
                </div>

                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="form-group checkbox-group">
                        <input type="checkbox" id="terms" required />
                        <label htmlFor="terms">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
                    </div>

                    <Button type="submit" size="lg" className="w-full" loading={loading} loadingText="Creating account...">Create Account</Button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login</span></p>
                </div>
            </div>
            <div className="auth-background"></div>
        </div>
    );
};

export default Signup;