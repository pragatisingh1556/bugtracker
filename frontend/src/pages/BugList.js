// Bug List Page
// Shows all reported bugs in a table format
// Users can filter bugs by Status, Severity, and Priority
// Clicking on any bug row opens its detail page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function BugList(props) {
    var token = props.token;
    var [bugs, setBugs] = useState([]);
    var [loading, setLoading] = useState(true);
    var navigate = useNavigate();

    // Filter states - empty string means "show all"
    var [statusFilter, setStatusFilter] = useState("");
    var [severityFilter, setSeverityFilter] = useState("");
    var [priorityFilter, setPriorityFilter] = useState("");

    // Fetch bugs whenever filters change
    useEffect(function() {
        fetchBugs();
    }, [statusFilter, severityFilter, priorityFilter]);

    function fetchBugs() {
        var headers = { Authorization: "Bearer " + token };

        // Build URL query string from active filters
        var params = "";
        var parts = [];
        if (statusFilter) { parts.push("status=" + statusFilter); }
        if (severityFilter) { parts.push("severity=" + severityFilter); }
        if (priorityFilter) { parts.push("priority=" + priorityFilter); }

        if (parts.length > 0) {
            params = "?" + parts.join("&");
        }

        axios.get(API_URL + "/bugs" + params, { headers: headers })
            .then(function(response) {
                setBugs(response.data);
                setLoading(false);
            })
            .catch(function(err) {
                console.log("Error fetching bugs:", err);
                setLoading(false);
            });
    }

    // Convert database date to readable format like 28/03/2026
    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }

        return day + "/" + month + "/" + year;
    }

    // Make status text more readable (e.g., "in_progress" -> "In Progress")
    function formatStatus(status) {
        if (status === "in_progress") return "In Progress";
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    if (loading) {
        return <div className="loading">Loading bugs...</div>;
    }

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: "4px" }}>All Bugs</h1>
                    <p className="page-subtitle">
                        {bugs.length === 0 ? "No bugs found with current filters" : "Showing " + bugs.length + " bug" + (bugs.length !== 1 ? "s" : "")}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={function() { navigate("/report"); }}>
                    + Report New Bug
                </button>
            </div>

            {/* Filter Section - narrow down bugs by status, severity, priority */}
            <div className="filters-bar">
                <span className="filter-label">Filter by:</span>
                <select value={statusFilter} onChange={function(e) { setStatusFilter(e.target.value); }}>
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>

                <select value={severityFilter} onChange={function(e) { setSeverityFilter(e.target.value); }}>
                    <option value="">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select value={priorityFilter} onChange={function(e) { setPriorityFilter(e.target.value); }}>
                    <option value="">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                {(statusFilter || severityFilter || priorityFilter) ? (
                    <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: "12px" }} onClick={function() {
                        setStatusFilter("");
                        setSeverityFilter("");
                        setPriorityFilter("");
                    }}>
                        Clear Filters
                    </button>
                ) : null}
            </div>

            <div className="card">
                {bugs.length === 0 ? (
                    <div className="empty-state">
                        <p>No bugs found</p>
                        <p style={{ fontSize: "14px", marginBottom: "20px" }}>
                            {(statusFilter || severityFilter || priorityFilter)
                                ? "Try changing or clearing the filters above"
                                : "Click the button below to report the first bug"}
                        </p>
                        {!(statusFilter || severityFilter || priorityFilter) && (
                            <button className="btn btn-primary" onClick={function() { navigate("/report"); }}>
                                Report First Bug
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="bug-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Severity</th>
                                <th>Priority</th>
                                <th>Reported By</th>
                                <th>Assigned To</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bugs.map(function(bug) {
                                return (
                                    <tr key={bug.id} onClick={function() { navigate("/bugs/" + bug.id); }}>
                                        <td>#{bug.id}</td>
                                        <td>{bug.title}</td>
                                        <td><span className={"badge badge-" + bug.status}>{formatStatus(bug.status)}</span></td>
                                        <td><span className={"badge badge-" + bug.severity}>{bug.severity}</span></td>
                                        <td><span className={"badge badge-" + bug.priority}>{bug.priority}</span></td>
                                        <td>{bug.reporter_name}</td>
                                        <td>{bug.assignee_name || "Not Assigned"}</td>
                                        <td>{formatDate(bug.created_at)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default BugList;
