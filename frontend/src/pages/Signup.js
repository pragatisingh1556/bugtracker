// Signup Page
// New users create their account here
// They choose a role: Admin, Developer, or Tester
// After signup, they are redirected to the Login page

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function Signup(props) {
    var [name, setName] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [role, setRole] = useState("tester");
    var [error, setError] = useState("");
    var [success, setSuccess] = useState("");
    var [loading, setLoading] = useState(false);
    var navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Make sure all fields are filled
        if (!name || !email || !password) {
            setError("Please fill in all the fields to create your account");
            return;
        }

        // Password should be at least 6 characters for security
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        // Send signup request to backend
        axios.post(API_URL + "/auth/signup", {
            name: name,
            email: email,
            password: password,
            role: role
        })
        .then(function(response) {
            setSuccess("Account created successfully! Redirecting to login...");
            setLoading(false);

            // Redirect to login page after 2 seconds
            setTimeout(function() {
                navigate("/");
            }, 2000);
        })
        .catch(function(err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError("Could not connect to server. Please check if backend is running.");
            }
            setLoading(false);
        });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">BugTracker</h1>
                <p className="auth-subtitle">Create your account to get started</p>

                {error ? <div className="error-msg">{error}</div> : null}
                {success ? <div className="success-msg">{success}</div> : null}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Pragati Singh"
                            value={name}
                            onChange={function(e) { setName(e.target.value); }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. pragati@company.com"
                            value={email}
                            onChange={function(e) { setEmail(e.target.value); }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={function(e) { setPassword(e.target.value); }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Your Role</label>
                        <select value={role} onChange={function(e) { setRole(e.target.value); }}>
                            <option value="tester">Tester - Find and report bugs</option>
                            <option value="developer">Developer - Fix reported bugs</option>
                            <option value="admin">Admin - Manage everything</option>
                        </select>
                        <span className="form-hint">
                            {role === "tester" && "Testers can report bugs and add comments"}
                            {role === "developer" && "Developers can fix bugs and update their status"}
                            {role === "admin" && "Admins can manage bugs, users, and everything else"}
                        </span>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/">Login here</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
