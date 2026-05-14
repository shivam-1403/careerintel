import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import '../Landing.css';

const Terms = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <Loader message="Loading Terms of Service..." />;
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
                        <Link to="/" className="back-link">
                            <ArrowLeft size={18} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="info-container">
                <div className="info-card glass">
                    <h1 className="info-title">Terms of Service</h1>
                    <p className="info-subtitle">Last updated: {lastUpdated}</p>

                    <div className="info-content">
                        <section className="info-section">
                            <h2>Acceptance of Terms</h2>
                            <p>
                                By accessing and using CareerIntel, you accept and agree to be bound by the terms
                                and provision of this agreement. If you do not agree to abide by these terms,
                                please do not use our service.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Description of Service</h2>
                            <p>
                                CareerIntel provides an AI-powered platform for career discovery, skill gap
                                analysis, and personalized learning path generation. The service is provided
                                "as is" and we reserve the right to modify or discontinue the service at any time.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>User Accounts</h2>
                            <p>When you create an account, you agree to:</p>
                            <ul className="info-list">
                                <li>Provide accurate and complete registration information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>User Conduct</h2>
                            <p>You agree not to use the service to:</p>
                            <ul className="info-list">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe upon the rights of others</li>
                                <li>Submit false or misleading information</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Distribute malicious software or viruses</li>
                            </ul>
                        </section>

                        <section className="info-section">
                            <h2>Intellectual Property</h2>
                            <p>
                                The CareerIntel platform, including all content, features, and functionality,
                                is owned by CareerIntel and is protected by copyright, trademark, and other
                                intellectual property laws. You may not copy, modify, distribute, sell, or
                                lease any part of our service without our prior written consent.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>User Content</h2>
                            <p>
                                You retain ownership of any content you submit to CareerIntel, such as resumes
                                and profile information. By submitting content, you grant us a license to use
                                it solely for providing and improving our services to you.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Disclaimer of Warranties</h2>
                            <p>
                                CareerIntel is provided "as is" without any warranties, express or implied.
                                We do not guarantee that the service will be uninterrupted, secure, or error-free.
                                Career recommendations generated by our AI are for informational purposes only
                                and should not be considered professional career counseling.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Limitation of Liability</h2>
                            <p>
                                CareerIntel shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages resulting from your use of or inability
                                to use the service. Our total liability shall not exceed the amount paid by
                                you, if any, for using our service.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Indemnification</h2>
                            <p>
                                You agree to indemnify and hold CareerIntel harmless from any claims, damages,
                                losses, liabilities, costs, or expenses arising out of your use of the service
                                or any violation of these terms.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Termination</h2>
                            <p>
                                We may terminate or suspend your account at any time for violation of these
                                terms. You may also delete your account at any time through your account settings.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Governing Law</h2>
                            <p>
                                These terms shall be governed by and construed in accordance with applicable
                                laws. Any disputes shall be resolved in the appropriate courts of competent jurisdiction.
                            </p>
                        </section>

                        <section className="info-section">
                            <h2>Changes to Terms</h2>
                            <p>
                                We may modify these terms at any time. Continued use of CareerIntel after changes
                                constitutes acceptance of the modified terms. We will notify users of material changes.
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

export default Terms;