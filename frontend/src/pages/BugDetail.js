// Bug Detail Page
// Shows complete information about a single bug
// Users can: update the bug status, add comments, and delete (admin only)
// The comment section allows team collaboration on bug fixes

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function BugDetail(props) {
    var token = props.token;
    var user = props.user;
    var params = useParams();
    var bugId = params.id;
    var navigate = useNavigate();

    var [bug, setBug] = useState(null);
    var [loading, setLoading] = useState(true);
    var [newComment, setNewComment] = useState("");
    var [newStatus, setNewStatus] = useState("");

    // Fetch bug details and its comments from backend
    useEffect(function() {
        fetchBug();
    }, [bugId]);

    function fetchBug() {
        var headers = { Authorization: "Bearer " + token };

        axios.get(API_URL + "/bugs/" + bugId, { headers: headers })
            .then(function(response) {
                setBug(response.data);
                setNewStatus(response.data.status);
                setLoading(false);
            })
            .catch(function(err) {
                console.log("Error fetching bug:", err);
                setLoading(false);
            });
    }

    // Update the bug's status (Open -> In Progress -> Resolved -> Closed)
    function handleStatusUpdate() {
        var headers = { Authorization: "Bearer " + token };

        axios.put(API_URL + "/bugs/" + bugId, { status: newStatus }, { headers: headers })
            .then(function(response) {
                fetchBug();
            })
            .catch(function(err) {
                console.log("Error updating status:", err);
            });
    }

    // Add a new comment to this bug
    function handleAddComment(e) {
        e.preventDefault();

        if (!newComment.trim()) {
            return;
        }

        var headers = { Authorization: "Bearer " + token };

        axios.post(API_URL + "/bugs/" + bugId + "/comments", { comment: newComment }, { headers: headers })
            .then(function(response) {
                setNewComment("");
                fetchBug();
            })
            .catch(function(err) {
                console.log("Error adding comment:", err);
            });
    }

    // Delete this bug - only admins can do this
    function handleDelete() {
        var confirmDelete = window.confirm("Are you sure you want to delete this bug? This action cannot be undone.");
        if (!confirmDelete) {
            return;
        }

        var headers = { Authorization: "Bearer " + token };

        axios.delete(API_URL + "/bugs/" + bugId, { headers: headers })
            .then(function(response) {
                navigate("/bugs");
            })
            .catch(function(err) {
                console.log("Error deleting bug:", err);
                alert("Could not delete bug. Only admins can delete bugs.");
            });
    }

    // Format date to readable format like "28/03/2026 14:30"
    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }

        return day + "/" + month + "/" + year + " at " + hours + ":" + minutes;
    }

    // Make status text more readable
    function formatStatus(status) {
        if (status === "in_progress") return "In Progress";
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    if (loading) {
        return <div className="loading">Loading bug details...</div>;
    }

    if (!bug) {
        return <div className="loading">Bug not found. It may have been deleted.</div>;
    }

    return (
        <div>
            <button className="btn btn-secondary" onClick={function() { navigate("/bugs"); }} style={{ marginBottom: "20px" }}>
                &larr; Back to Bug List
            </button>

            {/* Bug Information Card */}
            <div className="card">
                <div className="bug-header">
                    <div>
                        <div className="bug-title">#{bug.id} - {bug.title}</div>
                        <div className="bug-meta">
                            <div className="bug-meta-item">
                                Status: <span className={"badge badge-" + bug.status}>{formatStatus(bug.status)}</span>
                            </div>
                            <div className="bug-meta-item">
                                Severity: <span className={"badge badge-" + bug.severity}>{bug.severity}</span>
                            </div>
                            <div className="bug-meta-item">
                                Priority: <span className={"badge badge-" + bug.priority}>{bug.priority}</span>
                            </div>
                        </div>
                    </div>
                    {user.role === "admin" ? (
                        <button className="btn btn-danger" onClick={handleDelete}>Delete Bug</button>
                    ) : null}
                </div>

                <div className="bug-meta" style={{ marginBottom: "15px" }}>
                    <div className="bug-meta-item">
                        Reported by: <strong>{bug.reporter_name}</strong>
                    </div>
                    <div className="bug-meta-item">
                        Assigned to: <strong>{bug.assignee_name || "Not Assigned Yet"}</strong>
                    </div>
                    <div className="bug-meta-item">
                        Created: <strong>{formatDate(bug.created_at)}</strong>
                    </div>
                    <div className="bug-meta-item">
                        Last Updated: <strong>{formatDate(bug.updated_at)}</strong>
                    </div>
                </div>

                {/* Bug Description */}
                <div className="bug-description">
                    {bug.description}
                </div>

                {/* Status Update Section */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "20px" }}>
                    <label style={{ color: "#9E9E9E", fontSize: "13px", fontWeight: "600" }}>Update Status:</label>
                    <select
                        value={newStatus}
                        onChange={function(e) { setNewStatus(e.target.value); }}
                        style={{ padding: "8px 14px", background: "#0F1923", border: "1px solid #2A3A4A", borderRadius: "8px", color: "#E0E0E0", fontFamily: "Inter, sans-serif" }}
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button className="btn btn-primary" onClick={handleStatusUpdate} style={{ padding: "8px 20px" }}>
                        Update
                    </button>
                </div>
            </div>

            {/* Comments Section - Team Discussion */}
            <div className="comments-section">
                <div className="comments-title">
                    Team Discussion ({bug.comments ? bug.comments.length : 0} comment{bug.comments && bug.comments.length !== 1 ? "s" : ""})
                </div>

                {bug.comments && bug.comments.length > 0 ? (
                    bug.comments.map(function(comment) {
                        return (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.user_name}</span>
                                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                                </div>
                                <div className="comment-text">{comment.comment}</div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ color: "#9E9E9E", fontSize: "14px", marginBottom: "15px" }}>
                        No comments yet. Be the first to add one!
                    </div>
                )}

                <form className="comment-form" onSubmit={handleAddComment}>
                    <input
                        type="text"
                        placeholder="Write a comment... (e.g. 'Fixed by updating the API endpoint')"
                        value={newComment}
                        onChange={function(e) { setNewComment(e.target.value); }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BugDetail;
