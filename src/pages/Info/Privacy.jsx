import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import ThemeToggle from '../../components/ui/ThemeToggle';
import '../Landing.css';

const Privacy = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <Loader message="Loading Privacy Policy..." />;
    }

    const lastUpdated = "May 12, 2026";

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
                <div className="info-card glass">
                    <h1 className="info-title">Privacy Policy</h1>
                    <p className="info-subtitle">Last updated: {lastUpdated}</p>

                    <div className="info-content">
                        <section className="info-section">
                            <h2>Introduction</h2>
                            <p>
                                At CareerIntel, we take your privacy seriously. This Privacy Policy explains how we
                                collect, use, disclose, and safeguard your information when you use our platform.
                                Please read this policy carefully to understand our practices regarding your data.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Information We Collect</h2>
                            <p>We collect information that you provide directly to us, including:</p>
                            <ul className="info-list">
                                <li>Account information (name, email) when you sign up</li>
                                <li>Resume and CV data that you upload for analysis</li>
                                <li>Skill assessments and career preference responses</li>
                                <li>Learning path progress and completion data</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="info-list">
                                <li>Provide and improve our career guidance services</li>
                                <li>Generate personalized learning recommendations</li>
                                <li>Analyze skill gaps and career suitability</li>
                                <li>Communicate with you about your account and updates</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>Data Storage and Security</h2>
                            <p>
                                Your data is stored on secure servers with industry-standard encryption. We implement
                                appropriate technical and organizational measures to protect your personal information
                                against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="info-list">
                                <li>Access your personal data at any time</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your account and associated data</li>
                                <li>Export your data in a portable format</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>Cookies and Tracking</h2>
                            <p>
                                We use essential cookies to maintain your login session and improve your experience.
                                These are necessary for the platform to function properly. We do not use
                                tracking cookies for advertising purposes.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Children's Privacy</h2>
                            <p>
                                CareerIntel is intended for students and professionals. We do not knowingly collect
                                information from children under 13. If we become aware of such collection, we will
                                delete it immediately.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                material changes by posting the new policy on this page and updating the "Last
                                updated" date. Your continued use after changes constitutes acceptance.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at
                                privacy@careerintel.io
                            </p>
                        </section>
                    </div>

                    <div className="info-actions">
                        <Button onClick={() => navigate('/contact')}>Questions? Contact Us</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;