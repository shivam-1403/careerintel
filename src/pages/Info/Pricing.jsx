import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Star, Zap, Crown } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import ThemeToggle from '../../components/ui/ThemeToggle';
import '../Landing.css';

const Pricing = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const premiumFeatures = [
        {
            icon: <Zap />,
            title: 'Advanced AI Insights',
            description: 'Deeper career predictions powered by enhanced machine learning models.'
        },
        {
            icon: <Star />,
            title: 'Premium Learning Roadmaps',
            description: 'Access exclusive curated content from industry experts.'
        },
        {
            icon: <Crown />,
            title: 'Recruiter Tools',
            description: 'Direct connections to hiring partners and exclusive job listings.'
        },
        {
            icon: <CheckCircle />,
            title: 'Resume Optimization',
            description: 'AI-powered resume reviews with personalized improvement suggestions.'
        },
        {
            icon: <Clock />,
            title: 'Priority Support',
            description: 'Get faster responses from our career counseling team.'
        },
        {
            icon: <Star />,
            title: 'Certification Tracks',
            description: 'Earn recognized certificates to boost your professional profile.'
        }
    ];

    if (loading) {
        return <Loader message="Loading Pricing page..." />;
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
                        <ThemeToggle />
                        <Link to="/" className="back-link">
                            <ArrowLeft size={18} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="info-container">
                <div className="info-card glass pricing-card">
                    <div className="coming-soon-badge">
                        <Clock size={16} /> Coming Soon
                    </div>

                    <h1 className="info-title">Premium Plans</h1>
                    <p className="info-subtitle">
                        Unlock your full career potential with our premium features and services.
                    </p>

                    <div className="free-tier-info">
                        <h2>Current Free Tier</h2>
                        <p>
                            CareerIntel is currently completely free to use. All basic features including
                            career discovery, skill gap analysis, and personalized learning paths are
                            available at no cost.
                        </p>
                    </div>

                    <div className="premium-features-section">
                        <h2>What's Coming in Premium</h2>
                        <p className="premium-subtitle">
                            We're working on these exciting features to help you advance even further.
                        </p>

                        <div className="premium-features-grid">
                            {premiumFeatures.map((feature, index) => (
                                <div key={index} className="premium-feature-item">
                                    <div className="premium-feature-icon">
                                        {feature.icon}
                                    </div>
                                    <div className="premium-feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pricing-notice">
                        <p>
                            <strong>Note:</strong> Pricing details will be announced when premium features launch.
                            Existing free tier users will receive special early access discounts.
                        </p>
                    </div>

                    <div className="info-actions">
                        <Button onClick={() => navigate('/signup')}>Get Started for Free</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;