import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            console.log("Stored token:", token); // keep this for debug

            if (!token) return;

           const res = await fetch("http://127.0.0.1:8000/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();   // ✅ FIRST parse

            if (data.profile_image) {
                setProfileImage(data.profile_image);
            }
            console.log("Profile response:", data);

            if (res.ok) {
                setUser(data);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const img = localStorage.getItem("profile_image");
        if (img) setProfileImage(img);
    }, []);

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
                    {profileImage ? (
                        <img
                        src={profileImage}
                        alt="profile"
                        className="nav-profile-img"
                        />
                    ) : (
                        <>
                        {user?.first_name?.charAt(0)}
                        {user?.last_name?.charAt(0)}
                        </>
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
