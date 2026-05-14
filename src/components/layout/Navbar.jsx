import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, X, TrendingUp, Target, Lightbulb, Zap, Briefcase, Code, Loader2 } from 'lucide-react';
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
    const [searchResults, setSearchResults] = useState({ roles: [], skills: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    // Refs
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);
    const notificationRef = useRef(null);

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

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

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search function
    const performSearch = useCallback(async (query) => {
        if (!query || query.trim().length < 1) {
            setSearchResults({ roles: [], skills: [] });
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        try {
            const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`);
            if (!res.ok) {
                throw new Error(`Search failed: ${res.status}`);
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format");
            }
            const data = await res.json();
            // Safely handle response with fallback arrays
            setSearchResults({
                roles: Array.isArray(data.roles) ? data.roles : [],
                skills: Array.isArray(data.skills) ? data.skills : []
            });
            setShowDropdown(true);
        } catch (err) {
            console.error("Search error:", err);
            // Safe fallback on error
            setSearchResults({ roles: [], skills: [] });
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle search input with debounce
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setSelectedIndex(-1);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            setSearchResults({ roles: [], skills: [] });
            setShowDropdown(false);
            setIsSearching(false);
            return;
        }

        debounceRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);
    };

    // Get all flattened results for keyboard navigation
    const getAllResults = () => {
        const roles = Array.isArray(searchResults.roles) ? searchResults.roles.map(r => ({ ...r, type: 'role' })) : [];
        const skills = Array.isArray(searchResults.skills) ? searchResults.skills.map(s => ({ ...s, type: 'skill' })) : [];
        return [...roles, ...skills];
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        const allResults = getAllResults();

        if (!showDropdown || allResults.length === 0) {
            if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/career-recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
                setShowDropdown(false);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && allResults[selectedIndex]) {
                    handleResultClick(allResults[selectedIndex]);
                } else if (searchQuery.trim()) {
                    navigate(`/career-recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                }
                setShowDropdown(false);
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Handle result click
    const handleResultClick = (result) => {
        if (result.type === 'role') {
            navigate(`/career-recommendations?role=${result.id}`);
        } else {
            // For skills, search in career recommendations to show roles requiring that skill
            navigate(`/career-recommendations?search=${encodeURIComponent(result.name)}`);
        }
        setSearchQuery('');
        setShowDropdown(false);
        setSelectedIndex(-1);
    };

    // Handle search input enter key (for direct search)
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() && !showDropdown) {
            navigate(`/career-recommendations?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowDropdown(false);
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

    const allResults = getAllResults();
    const hasResults = (Array.isArray(searchResults.roles) && searchResults.roles.length > 0) || (Array.isArray(searchResults.skills) && searchResults.skills.length > 0);

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="mobile-menu-btn" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="search-bar" ref={searchRef}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search careers or skills..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => searchQuery.trim() && hasResults && setShowDropdown(true)}
                    />
                    {isSearching && (
                        <div className="search-loading">
                            <Loader2 size={16} className="spinner" />
                        </div>
                    )}

                    {/* Search Dropdown */}
                    {showDropdown && (
                        <div className="search-dropdown" ref={dropdownRef}>
                            {searchQuery.trim() && !isSearching && !hasResults ? (
                                <div className="search-empty">
                                    <p>No results found</p>
                                </div>
                            ) : (
                                <>
                                    {Array.isArray(searchResults.roles) && searchResults.roles.length > 0 && (
                                        <div className="search-section">
                                            <div className="search-section-header">
                                                <Briefcase size={14} />
                                                <span>Careers</span>
                                            </div>
                                            <div className="search-results">
                                                {searchResults.roles.map((role, idx) => {
                                                    const globalIdx = idx;
                                                    return (
                                                        <div
                                                            key={`role-${role.id}`}
                                                            className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                                                            onClick={() => handleResultClick({ ...role, type: 'role' })}
                                                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        >
                                                            <Briefcase size={16} className="result-icon career-icon" />
                                                            <div className="result-content">
                                                                <span className="result-name">{role.name}</span>
                                                                <span className="result-category">{role.category}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {Array.isArray(searchResults.skills) && searchResults.skills.length > 0 && (
                                        <div className="search-section">
                                            <div className="search-section-header">
                                                <Code size={14} />
                                                <span>Skills</span>
                                            </div>
                                            <div className="search-results">
                                                {searchResults.skills.map((skill, idx) => {
                                                    const globalIdx = (Array.isArray(searchResults.roles) ? searchResults.roles.length : 0) + idx;
                                                    return (
                                                        <div
                                                            key={`skill-${skill.id}`}
                                                            className={`search-result-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                                                            onClick={() => handleResultClick({ ...skill, type: 'skill' })}
                                                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                        >
                                                            <Code size={16} className="result-icon skill-icon" />
                                                            <div className="result-content">
                                                                <span className="result-name">{skill.name}</span>
                                                                <span className="result-category">{skill.category}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
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