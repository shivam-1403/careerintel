import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from 'lucide-react';
import './Navbar.css';

const BASE_URL = "https://careerintel-w10f.onrender.com";

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for localStorage changes (e.g., after profile upload)
    useEffect(() => {
        const updateProfileImage = () => {
            const storedImage = localStorage.getItem("profile_image");
            if (storedImage) {
                const fullUrl = storedImage.startsWith("http")
                    ? storedImage
                    : `${BASE_URL}${storedImage}`;
                setProfileImage(fullUrl);
            }
        };

        // Listen for storage events from other tabs
        window.addEventListener('storage', updateProfileImage);

        // Listen for custom event from same tab
        window.addEventListener('profile-image-updated', updateProfileImage);

        // Check initial value
        updateProfileImage();

        return () => {
            window.removeEventListener('storage', updateProfileImage);
            window.removeEventListener('profile-image-updated', updateProfileImage);
        };
    }, []);

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

                if (data.profile_image) {
                    const fullUrl = data.profile_image.startsWith("http")
                        ? data.profile_image
                        : `${BASE_URL}${data.profile_image}`;
                    setProfileImage(fullUrl);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Get initials for fallback avatar
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
                  <div className="user-avatar">
                    {loading ? (
                        <div className="avatar-loader"></div>
                    ) : profileImage ? (
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="nav-profile-img"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.target.style.display = 'none';
                                const initials = getInitials();
                                if (initials) {
                                    e.target.parentElement.innerHTML = `<span class="avatar-initials">${initials}</span>`;
                                }
                            }}
                        />
                    ) : (
                        <span className="avatar-initials">{getInitials()}</span>
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