import React from 'react';
import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    FileSearch,
    Target,
    Briefcase,
    Map,
    BarChart2,
    LogOut,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        { name: 'Resume Analyzer', path: '/resume-analyzer', icon: <FileSearch size={20} /> },
        { name: 'Career Recommendations', path: '/career-recommendations', icon: <Briefcase size={20} /> },
        { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: <Target size={20} /> },
        { name: 'Learning Path', path: '/learning-path', icon: <Map size={20} /> },
        { name: 'Progress Tracker', path: '/progress', icon: <BarChart2 size={20} /> },
    ];

    const handleLogout = () => {
        // Clear all user-related localStorage data
        localStorage.removeItem("token");
        localStorage.removeItem("user_skills");
        navigate("/login", { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">CI</div>
                <span className="brand-name">CareerIntel</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <p className="nav-section-title">Main Menu</p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;