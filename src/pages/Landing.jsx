import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Rocket, Target, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (sectionId) => {
        if (location.pathname === '/') {
            // Already on homepage, just scroll
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate to home first, then scroll after a short delay
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const features = [
        {
            icon: <Target className="text-primary" />,
            title: 'Career Discovery',
            description: 'Uncover your ideal career path using AI-driven personality and skill analysis.'
        },
        {
            icon: <Rocket className="text-primary" />,
            title: 'Skill Gap Analysis',
            description: 'Identify exactly which skills you need for your target job and how to bridge them.'
        },
        {
            icon: <Zap className="text-primary" />,
            title: 'Personalized Roadmaps',
            description: 'Get a step-by-step learning journey with curated resources tailored to you.'
        }
    ];

    const steps = [
        'Upload your resume or enter your current skills.',
        'Select your dream career or let our AI recommend one.',
        'Follow your personalized roadmap to success.'
    ];

    return (
        <div className="landing-page">
            <nav className="landing-nav glass">
                <div className="container nav-content">
                    <div className="brand">
                        <div className="brand-logo">CI</div>
                        <span className="brand-name">CareerIntel</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it Works</a>
                        <ThemeToggle />
                        <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                        <Button onClick={() => navigate('/signup')}>Get Started</Button>
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="container hero-content">
                    <h1 className="hero-title">
                        Unlock Your Future with <span className="gradient-text">AI-Driven Career Intelligence</span>
                    </h1>
                    <p className="hero-description">
                        The all-in-one platform for students to discover career paths, analyze skills, and generate personalized learning roadmaps.
                    </p>
                    <div className="hero-actions">
                        <Button size="lg" onClick={() => navigate('/signup')}>
                            Start Your Journey <ArrowRight size={20} />
                        </Button>
                        <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Explore Careers</Button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-value"><Zap className="stat-icon" /></span>
                            <span className="stat-label">AI-Powered Matching</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value"><Target className="stat-icon" /></span>
                            <span className="stat-label">Personalized Learning Paths</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value"><Shield className="stat-icon" /></span>
                            <span className="stat-label">Career-Focused Insights</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need to Succeed</h2>
                        <p className="section-subtitle">Powerful tools designed to accelerate your professional growth.</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="steps-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Simple 3-Step Process</h2>
                    </div>
                    <div className="steps-grid">
                        {steps.map((step, index) => (
                            <div key={index} className="step-item">
                                <div className="step-number">{index + 1}</div>
                                <p className="step-text">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="container footer-content">
                    <div className="footer-brand">
                        <div className="brand">
                            <div className="brand-logo">AI</div>
                            <span className="brand-name">CareerIntel</span>
                        </div>
                        <p>Empowering the next generation of professionals.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Product</h4>
                            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                            <Link to="/pricing">Pricing</Link>
                        </div>

                        <div className="link-group">
                            <h4>Company</h4>
                            <Link to="/about">About Us</Link>
                            <Link to="/contact">Contact</Link>
                        </div>

                        <div className="link-group">
                            <h4>Legal</h4>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 AI Career Intelligence Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
