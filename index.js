const express = require("express");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Add CORS to allow all origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Change as needed
  password: "", // Change as needed
  database: "sqli_lab",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database");
});

// VULNERABLE LOGIN ENDPOINT - Intentional SQL Injection vulnerability
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userIp = req.ip || req.connection.remoteAddress;

  // VULNERABLE CODE - Concatenating user input directly into SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Executing query: " + query); // Log for educational purposes

  db.query(query, (err, results) => {
    if (err) {
      // Log failed attempts
      const logQuery = `INSERT INTO logs (ip_address, username_attempt, success) VALUES (?, ?, ?)`;
      db.query(logQuery, [userIp, username, false]);

      return res.json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    if (results.length > 0) {
      // Log successful login
      const logQuery = `INSERT INTO logs (ip_address, username_attempt, success) VALUES (?, ?, ?)`;
      db.query(logQuery, [userIp, username, true]);

      res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: results[0].id,
          username: results[0].username,
          flag: results[0].flag,
        },
      });
    } else {
      // Log failed attempt
      const logQuery = `INSERT INTO logs (ip_address, username_attempt, success) VALUES (?, ?, ?)`;
      db.query(logQuery, [userIp, username, false]);

      res.json({
        success: false,
        message: "Invalid username or password",
      });
    }
  });
});

// Dashboard data endpoint (also vulnerable to blind SQL injection)
app.get("/dashboard/:userId", (req, res) => {
  const userId = req.params.userId;

  // VULNERABLE TO BLIND SQL INJECTION
  const query = `SELECT flag FROM users WHERE id = ${userId}`;

  db.query(query, (err, results) => {
    if (err || results.length === 0) {
      return res.json({
        success: false,
        message: "User not found or error occurred",
      });
    }

    res.json({
      success: true,
      flag: results[0].flag,
    });
  });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
