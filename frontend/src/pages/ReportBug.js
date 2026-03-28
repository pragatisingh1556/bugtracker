// Report Bug Page
// Users fill out this form to report a new bug
// Fields: Title, Description, Severity, Priority, and Assign to Developer
// After submitting, the bug appears in the Bug List

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function ReportBug(props) {
    var token = props.token;
    var navigate = useNavigate();

    var [title, setTitle] = useState("");
    var [description, setDescription] = useState("");
    var [severity, setSeverity] = useState("medium");
    var [priority, setPriority] = useState("medium");
    var [assignedTo, setAssignedTo] = useState("");
    var [developers, setDevelopers] = useState([]);
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    // Fetch list of developers so we can assign the bug to someone
    useEffect(function() {
        var headers = { Authorization: "Bearer " + token };

        axios.get(API_URL + "/users/developers", { headers: headers })
            .then(function(response) {
                setDevelopers(response.data);
            })
            .catch(function(err) {
                console.log("Error fetching developers:", err);
            });
    }, [token]);

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Both title and description are required
        if (!title) {
            setError("Please provide a title for the bug");
            return;
        }
        if (!description) {
            setError("Please describe the bug so developers can understand and fix it");
            return;
        }

        setLoading(true);

        var headers = { Authorization: "Bearer " + token };
        var bugData = {
            title: title,
            description: description,
            severity: severity,
            priority: priority,
            assigned_to: assignedTo || null
        };

        // Send bug data to backend
        axios.post(API_URL + "/bugs", bugData, { headers: headers })
            .then(function(response) {
                // Bug created - go to bug list to see it
                navigate("/bugs");
            })
            .catch(function(err) {
                if (err.response && err.response.data) {
                    setError(err.response.data.message);
                } else {
                    setError("Could not create bug. Please try again.");
                }
                setLoading(false);
            });
    }

    return (
        <div>
            <h1 className="page-title">Report a New Bug</h1>
            <p className="page-subtitle">Found a bug? Fill out the form below and we'll track it for you</p>

            <div className="card" style={{ maxWidth: "700px" }}>
                {error ? <div className="error-msg">{error}</div> : null}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Bug Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Login button not working on mobile"
                            value={title}
                            onChange={function(e) { setTitle(e.target.value); }}
                        />
                        <span className="form-hint">Write a short, clear title that summarizes the bug</span>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Describe the bug in detail:&#10;&#10;1. What were you trying to do?&#10;2. What did you expect to happen?&#10;3. What actually happened?"
                            value={description}
                            onChange={function(e) { setDescription(e.target.value); }}
                        />
                        <span className="form-hint">Include steps to reproduce, expected behavior, and actual behavior</span>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Severity</label>
                            <select value={severity} onChange={function(e) { setSeverity(e.target.value); }}>
                                <option value="low">Low - Minor issue, no impact on usage</option>
                                <option value="medium">Medium - Causes inconvenience but workaround exists</option>
                                <option value="high">High - Major feature is broken</option>
                                <option value="critical">Critical - System is down or data loss</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select value={priority} onChange={function(e) { setPriority(e.target.value); }}>
                                <option value="low">Low - Can be fixed later</option>
                                <option value="medium">Medium - Should be fixed soon</option>
                                <option value="high">High - Must be fixed immediately</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Assign to Developer (Optional)</label>
                        <select value={assignedTo} onChange={function(e) { setAssignedTo(e.target.value); }}>
                            <option value="">-- Select a developer --</option>
                            {developers.map(function(dev) {
                                return <option key={dev.id} value={dev.id}>{dev.name} ({dev.email})</option>;
                            })}
                        </select>
                        <span className="form-hint">You can assign this bug to a developer now or do it later</span>
                    </div>

                    <div style={{ display: "flex", gap: "15px" }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Bug Report"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={function() { navigate("/bugs"); }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportBug;
