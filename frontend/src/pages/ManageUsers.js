// Manage Users Page (Admin Only)
// Only admin users can access this page
// Shows all registered users with their roles
// Admin can delete users (but cannot delete their own account)

import React, { useState, useEffect } from "react";
import axios from "axios";

var API_URL = "http://localhost:5000/api";

function ManageUsers(props) {
    var token = props.token;
    var [users, setUsers] = useState([]);
    var [loading, setLoading] = useState(true);

    // Fetch all users when page loads
    useEffect(function() {
        fetchUsers();
    }, []);

    function fetchUsers() {
        var headers = { Authorization: "Bearer " + token };

        axios.get(API_URL + "/users", { headers: headers })
            .then(function(response) {
                setUsers(response.data);
                setLoading(false);
            })
            .catch(function(err) {
                console.log("Error fetching users:", err);
                setLoading(false);
            });
    }

    // Delete a user after confirmation
    function handleDelete(userId, userName) {
        var confirmDelete = window.confirm("Are you sure you want to delete " + userName + "? This will remove their account permanently.");
        if (!confirmDelete) {
            return;
        }

        var headers = { Authorization: "Bearer " + token };

        axios.delete(API_URL + "/users/" + userId, { headers: headers })
            .then(function(response) {
                fetchUsers();
            })
            .catch(function(err) {
                if (err.response && err.response.data) {
                    alert(err.response.data.message);
                } else {
                    alert("Could not delete user. Please try again.");
                }
            });
    }

    // Format date to readable format
    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        if (day < 10) { day = "0" + day; }
        if (month < 10) { month = "0" + month; }

        return day + "/" + month + "/" + year;
    }

    // Get role display name
    function getRoleName(role) {
        if (role === "admin") return "Admin";
        if (role === "developer") return "Developer";
        if (role === "tester") return "Tester";
        return role;
    }

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    // Count users by role
    var adminCount = users.filter(function(u) { return u.role === "admin"; }).length;
    var devCount = users.filter(function(u) { return u.role === "developer"; }).length;
    var testerCount = users.filter(function(u) { return u.role === "tester"; }).length;

    return (
        <div>
            <h1 className="page-title">Manage Users</h1>
            <p className="page-subtitle">
                {users.length} total user{users.length !== 1 ? "s" : ""} &mdash; {adminCount} Admin{adminCount !== 1 ? "s" : ""}, {devCount} Developer{devCount !== 1 ? "s" : ""}, {testerCount} Tester{testerCount !== 1 ? "s" : ""}
            </p>

            <div className="card">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <p>No users found</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined On</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(function(u) {
                                return (
                                    <tr key={u.id}>
                                        <td>#{u.id}</td>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td><span className={"badge badge-" + u.role} style={{
                                            background: u.role === "admin" ? "rgba(255, 82, 82, 0.15)" : u.role === "developer" ? "rgba(33, 150, 243, 0.15)" : "rgba(76, 175, 80, 0.15)",
                                            color: u.role === "admin" ? "#FF5252" : u.role === "developer" ? "#2196F3" : "#4CAF50"
                                        }}>{getRoleName(u.role)}</span></td>
                                        <td>{formatDate(u.created_at)}</td>
                                        <td>
                                            <button className="btn btn-danger" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={function() { handleDelete(u.id, u.name); }}>
                                                Delete
                                            </button>
                                        </td>
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

export default ManageUsers;
