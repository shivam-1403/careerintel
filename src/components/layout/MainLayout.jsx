import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="main-layout">
            <Sidebar isOpen={sidebarOpen} />
            <div className="main-content-wrapper">
                <Navbar toggleSidebar={toggleSidebar} />
                <main className="main-content">
                    {children}
                </main>
            </div>
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}
        </div>
    );
};

export default MainLayout;
