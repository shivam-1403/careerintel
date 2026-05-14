import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import '../Landing.css';

const About = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate page load
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <Loader message="Loading About page..." />;
    }

    return (
        <div className="info-page">
            <nav className="landing-nav glass">
                <div className="container nav-content">
                    <div className="brand" onClick={() => navigate('/')}>
                        <div className="brand-logo">CI</div>
                        <span className="brand-name">CareerIntel</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/" className="back-link">
                            <ArrowLeft size={18} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="info-container">
                <div className="info-card glass">
                    <h1 className="info-title">About CareerIntel</h1>
                    <p className="info-subtitle">Empowering students to make informed career decisions.</p>

                    <div className="info-content">
                        <section className="info-section">
                            <h2>Our Mission</h2>
                            <p>
                                CareerIntel is designed to help students navigate the complex landscape of career choices.
                                We believe that every student deserves access to personalized career guidance that leverages
                                the power of artificial intelligence to match individual skills, interests, and aspirations
                                with real-world opportunities.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>What We Do</h2>
                            <p>
                                Our platform provides a comprehensive suite of tools to help students:
                            </p>
                            <ul className="info-list">
                                <li><CheckCircle size={16} /> Discover career paths aligned with their skills and interests</li>
                                <li><CheckCircle size={16} /> Analyze skill gaps for their dream jobs</li>
                                <li><CheckCircle size={16} /> Generate personalized learning roadmaps</li>
                                <li><CheckCircle size={16} /> Track progress throughout their career journey</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>Why CareerIntel?</h2>
                            <p>
                                Traditional career counseling often lacks the scalability and personalization that modern
                                students need. CareerIntel bridges this gap by providing AI-powered insights that adapt
                                to each user's unique profile, helping them make data-driven decisions about their future.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Our Values</h2>
                            <div className="values-grid">
                                <div className="value-item">
                                    <h3>Student-First</h3>
                                    <p>Every feature we build is designed with students' success in mind.</p>
                                </div>
                                <div className="value-item">
                                    <h3>Privacy Focused</h3>
                                    <p>We maintain strict data protection standards to keep your information safe.</p>
                                </div>
                                <div className="value-item">
                                    <h3>Continuous Innovation</h3>
                                    <p>We're constantly improving our AI models to provide better recommendations.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="info-actions">
                        <Button onClick={() => navigate('/signup')}>Get Started</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;