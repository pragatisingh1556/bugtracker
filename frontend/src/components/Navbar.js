// Navigation Bar Component
// This appears at the top of every page after login
// Shows: App name, navigation links, user info, and logout button
// Admin users see an extra "Manage Users" link

import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar(props) {
    var user = props.user;
    var onLogout = props.onLogout;
    var location = useLocation();

    // Check if the current page matches the link path
    function isActive(path) {
        if (location.pathname === path) {
            return "active";
        }
        return "";
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">BugTracker</Link>

            <div className="navbar-links">
                <Link to="/" className={isActive("/")}>Dashboard</Link>
                <Link to="/bugs" className={isActive("/bugs")}>All Bugs</Link>
                <Link to="/report" className={isActive("/report")}>Report Bug</Link>
                {user.role === "admin" ? (
                    <Link to="/users" className={isActive("/users")}>Manage Users</Link>
                ) : null}
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <div className="user-name">Hi, {user.name}</div>
                    <div className="user-role">{user.role}</div>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;
