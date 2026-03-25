import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

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
                setProfileImage(data.profile_image);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
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
                    {loading ? (
                        <div className="avatar-loader"></div>
                    ) : profileImage ? (
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
