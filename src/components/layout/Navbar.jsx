import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    "https://careerintel-w10f.onrender.com/user/profile",
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
                    <input type="text" placeholder="Search careers, skills, or courses..." />
                </div>
            </div>

            <div className="navbar-right">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>
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