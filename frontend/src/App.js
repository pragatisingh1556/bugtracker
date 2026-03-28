// main app component
// handles routing between different pages
// checks if user is logged in or not

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BugList from "./pages/BugList";
import ReportBug from "./pages/ReportBug";
import BugDetail from "./pages/BugDetail";
import ManageUsers from "./pages/ManageUsers";
import "./App.css";

function App() {
    // get user from localStorage (if already logged in)
    var savedUser = localStorage.getItem("user");
    var savedToken = localStorage.getItem("token");

    var [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
    var [token, setToken] = useState(savedToken ? savedToken : null);

    // function to handle login
    function handleLogin(userData, tokenData) {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    }

    // function to handle logout
    function handleLogout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    // if not logged in, show login page
    if (!user || !token) {
        return (
            <BrowserRouter>
                <div className="app">
                    <Routes>
                        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
                        <Route path="*" element={<Login onLogin={handleLogin} />} />
                    </Routes>
                </div>
            </BrowserRouter>
        );
    }

    // if logged in, show the main app
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar user={user} onLogout={handleLogout} />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard token={token} />} />
                        <Route path="/bugs" element={<BugList token={token} user={user} />} />
                        <Route path="/report" element={<ReportBug token={token} />} />
                        <Route path="/bugs/:id" element={<BugDetail token={token} user={user} />} />
                        <Route path="/users" element={
                            user.role === "admin" ? <ManageUsers token={token} /> : <Navigate to="/" />
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
