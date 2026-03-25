import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
        const response = await fetch("https://careerintel-w10f.onrender.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data); // DEBUG LINE

        if (!response.ok) {
            setError(data.detail || "Invalid email or password");
            return;
        }

        // ✅ STORE TOKEN
        localStorage.setItem("token", data.access_token);

        // confirm stored
        console.log("Stored token:", localStorage.getItem("token"));

        navigate("/dashboard");

    } catch (err) {
        console.error(err);
        setError("Server error. Try again later.");
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
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to continue your career journey.</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="label-row">
                            <label>Password</label>
                            <span className="auth-link small" onClick={() => navigate('/forgot-password')}>Forgot password?</span>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            required
                        />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <Button type="submit" size="lg" className="w-full">Login</Button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign up</span></p>
                </div>
            </div>
            <div className="auth-background"></div>
        </div>
    );
};

export default Login;
