import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import ThemeToggle from '../../components/ui/ThemeToggle';
import '../Landing.css';

const Contact = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitted(true);
        setSubmitting(false);
    };

    if (loading) {
        return <Loader message="Loading Contact page..." />;
    }

    if (submitted) {
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
                    <div className="info-card glass success-card">
                        <div className="success-icon">
                            <MessageCircle size={48} />
                        </div>
                        <h1>Message Sent!</h1>
                        <p>Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
                        <Button onClick={() => navigate('/')}>Return Home</Button>
                    </div>
                </div>
            </div>
        );
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
                    <h1 className="info-title">Contact Us</h1>
                    <p className="info-subtitle">We'd love to hear from you. Get in touch with our team.</p>

                    <div className="contact-options">
                        <div className="contact-option">
                            <Mail className="contact-icon" />
                            <h3>Email Support</h3>
                            <p>support@careerintel.io</p>
                        </div>
                        <div className="contact-option">
                            <MessageCircle className="contact-icon" />
                            <h3>General Inquiries</h3>
                            <p>info@careerintel.io</p>
                        </div>
                        <div className="contact-option">
                            <Clock className="contact-icon" />
                            <h3>Response Time</h3>
                            <p>Within 24-48 hours</p>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="How can we help?"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us more about your question..."
                                rows={5}
                                required
                            />
                        </div>
                        <Button type="submit" loading={submitting} disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Message'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;