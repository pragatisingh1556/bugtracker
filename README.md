# BugTracker

![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-Charts-red?logo=chartdotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)

A full stack bug tracking and reporting system built with React, Node.js, Express, and MySQL. Teams can report bugs, assign them to developers, track status, and view analytics on a dashboard.

## Features

- Login and Signup with role-based access (Admin, Developer, Tester)
- Report bugs with title, description, severity, priority
- Assign bugs to developers
- Track bug status (Open, In Progress, Resolved, Closed)
- Filter bugs by status, severity, and priority
- Dashboard with statistics and charts (Pie chart, Bar chart)
- Add comments on bugs
- Admin panel to manage users
- JWT token based authentication
- Responsive design with dark theme

## Tech Stack

- **Frontend:** React.js, React Router, Axios, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **Charts:** Chart.js with react-chartjs-2

## How to run

### 1. Setup MySQL Database

Make sure MySQL is installed and running. Then:

```bash
cd backend
npm install
node setup.js
```

This will create the database and tables automatically.

### 2. Configure Backend

Edit `backend/.env` file with your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bugtracker
JWT_SECRET=bugtracker_secret_key_2025
PORT=5000
```

### 3. Start Backend

```bash
cd backend
npm start
```

Server will run on http://localhost:5000

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

App will open on http://localhost:3000

### 5. Default Admin Login

```
Email: admin@bugtracker.com
Password: admin123
```

## Project Structure

```
bugtracker/
  backend/
    server.js          # express server setup
    db.js              # mysql connection pool
    setup.js           # database and table creation
    middleware.js       # jwt token verification
    routes/
      auth.js          # login and signup routes
      bugs.js          # bug CRUD routes
      users.js         # user management routes
    .env               # database credentials
  frontend/
    public/
      index.html       # html template
    src/
      App.js           # main app with routing
      App.css          # all styles (dark theme)
      index.js         # react entry point
      components/
        Navbar.js      # navigation bar
      pages/
        Login.js       # login page
        Signup.js      # signup page
        Dashboard.js   # stats and charts
        BugList.js     # all bugs with filters
        ReportBug.js   # bug report form
        BugDetail.js   # single bug view with comments
        ManageUsers.js # admin user management
```

## Screenshots

_Coming soon_

## Author

**Pragati Singh** - 2025 Graduate
