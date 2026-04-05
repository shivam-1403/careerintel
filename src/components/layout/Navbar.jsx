import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, TrendingUp, Target, Lightbulb, Zap } from 'lucide-react';
import './Navbar.css';

const BASE_URL = "https://careerintel-w10f.onrender.com";

// Modern notification data structure
const generateNotifications = () => {
    const now = new Date();
    const notifications = [
        {
            id: 1,
            type: 'improvement',
            icon: TrendingUp,
            title: 'Resume Score Update',
            description: 'Your resume score improved by +8% this week',
            time: '2 hours ago'
        },
        {
            id: 2,
            type: 'skill_gap',
            icon: Target,
            title: 'Skills to Develop',
            description: 'You have 6 skills pending for your target role',
            time: '1 day ago'
        },
        {
            id: 3,
            type: 'tip',
            icon: Lightbulb,
            title: 'Quick Tip',
            description: 'Complete your roadmap to increase job readiness',
            time: '2 days ago'
        },
        {
            id: 4,
            type: 'recommendation',
            icon: Zap,
            title: 'New Opportunity',
            description: 'Based on your skills, new roles match your profile',
            time: '3 days ago'
        }
    ];

    return notifications;
};

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Ref for outside click detection
    const notificationRef = useRef(null);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${BASE_URL}/user/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Initialize notifications
    useEffect(() => {
        setNotifications(generateNotifications());
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search input
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/career-recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    // Toggle notifications
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    // Get initials for avatar
    const getInitials = () => {
        if (!user) return "";
        const first = user.first_name?.charAt(0) || "";
        const last = user.last_name?.charAt(0) || "";
        return first + last;
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="mobile-menu-btn" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search careers, skills, or courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>
            </div>

            <div className="navbar-right">
                {/* Notifications */}
                <div className="notification-wrapper" ref={notificationRef}>
                    <button
                        className={`icon-btn ${showNotifications ? 'active' : ''}`}
                        onClick={toggleNotifications}
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        <span className="notification-dot"></span>
                    </button>

                    {/* Modern Notifications Dropdown */}
                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h4>Notifications</h4>
                                <span className="notification-count">{notifications.length} new</span>
                            </div>
                            <div className="notification-list">
                                {notifications.map((notification) => {
                                    const IconComponent = notification.icon;
                                    return (
                                        <div key={notification.id} className="notification-item">
                                            <div className="notification-icon-wrapper">
                                                <IconComponent size={18} />
                                            </div>
                                            <div className="notification-content">
                                                <h5>{notification.title}</h5>
                                                <p>{notification.description}</p>
                                                <span className="notification-time">{notification.time}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="notification-footer">
                                <button onClick={() => { setShowNotifications(false); navigate('/progress'); }}>
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div
                    className="user-profile"
                    onClick={() => navigate("/profile")}
                    style={{ cursor: "pointer" }}
                >
                    <div className="user-avatar" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#fff'
                    }}>
                        {loading ? (
                            <div className="avatar-loader"></div>
                        ) : (
                            <span>{getInitials()}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">
                            {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
                        </span>
                        <span className="user-role">Student</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;