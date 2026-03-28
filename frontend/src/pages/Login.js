// Login Page
// This is the first page users see when they open the app
// They enter their email and password to log in
// If they don't have an account, they can go to the Signup page

import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function Login(props) {
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Check if user filled both fields
        if (!email || !password) {
            setError("Please enter both email and password to continue");
            return;
        }

        setLoading(true);

        // Send login request to our backend API
        axios.post(API_URL + "/auth/login", {
            email: email,
            password: password
        })
        .then(function(response) {
            var data = response.data;
            // Pass user data and token to App.js (parent component)
            props.onLogin(data.user, data.token);
        })
        .catch(function(err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError("Could not connect to server. Please make sure the backend is running on port 5000.");
            }
            setLoading(false);
        });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">BugTracker</h1>
                <p className="auth-subtitle">Welcome back! Please login to continue</p>

                {error ? <div className="error-msg">{error}</div> : null}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. john@company.com"
                            value={email}
                            onChange={function(e) { setEmail(e.target.value); }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={function(e) { setPassword(e.target.value); }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="auth-link">
                    New here? <Link to="/signup">Create an Account</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
