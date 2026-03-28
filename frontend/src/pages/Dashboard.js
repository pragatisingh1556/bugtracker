// Dashboard Page
// This is the home page after login - shows overview of all bugs
// Displays stat cards (total, open, in progress, resolved)
// Shows two charts: Pie chart for status and Bar chart for severity
// Uses Chart.js library for data visualization

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components so they can be used
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

var API_URL = "http://localhost:5000/api";

function Dashboard(props) {
    var token = props.token;
    var [stats, setStats] = useState(null);
    var [loading, setLoading] = useState(true);

    // Fetch bug statistics from backend when page loads
    useEffect(function() {
        var headers = { Authorization: "Bearer " + token };

        axios.get(API_URL + "/bugs/stats", { headers: headers })
            .then(function(response) {
                setStats(response.data);
                setLoading(false);
            })
            .catch(function(err) {
                console.log("Error fetching stats:", err);
                setLoading(false);
            });
    }, [token]);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="loading">Could not load statistics. Please try again.</div>;
    }

    // Pie Chart - shows how many bugs are Open, In Progress, Resolved, Closed
    var statusChartData = {
        labels: ["Open", "In Progress", "Resolved", "Closed"],
        datasets: [{
            data: [
                stats.open_count || 0,
                stats.in_progress_count || 0,
                stats.resolved_count || 0,
                stats.closed_count || 0
            ],
            backgroundColor: ["#FF9800", "#2196F3", "#4CAF50", "#9E9E9E"],
            borderWidth: 0
        }]
    };

    // Bar Chart - shows bug count by severity level
    var severityChartData = {
        labels: ["Critical", "High", "Medium", "Low"],
        datasets: [{
            label: "Number of Bugs",
            data: [
                stats.critical_count || 0,
                stats.high_count || 0,
                stats.medium_count || 0,
                stats.low_count || 0
            ],
            backgroundColor: ["#FF5252", "#FF9800", "#2196F3", "#4CAF50"],
            borderWidth: 0,
            borderRadius: 6
        }]
    };

    // Chart display options
    var pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: "#9E9E9E", padding: 15 }
            }
        }
    };

    var barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: "#9E9E9E" },
                grid: { color: "rgba(255,255,255,0.05)" }
            },
            x: {
                ticks: { color: "#9E9E9E" },
                grid: { display: false }
            }
        }
    };

    return (
        <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Here's a quick summary of all reported bugs in the system</p>

            {/* Stat Cards - show key numbers at a glance */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-number">{stats.total || 0}</div>
                    <div className="stat-label">Total Bugs</div>
                </div>
                <div className="stat-card open">
                    <div className="stat-number">{stats.open_count || 0}</div>
                    <div className="stat-label">Open</div>
                </div>
                <div className="stat-card progress">
                    <div className="stat-number">{stats.in_progress_count || 0}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card resolved">
                    <div className="stat-number">{stats.resolved_count || 0}</div>
                    <div className="stat-label">Resolved</div>
                </div>
            </div>

            {/* Charts Section - visual representation of bug data */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-title">Bugs by Status</div>
                    <p className="chart-description">Distribution of bugs across different stages</p>
                    <Pie data={statusChartData} options={pieOptions} />
                </div>
                <div className="chart-card">
                    <div className="chart-title">Bugs by Severity</div>
                    <p className="chart-description">How many bugs fall under each severity level</p>
                    <Bar data={severityChartData} options={barOptions} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
