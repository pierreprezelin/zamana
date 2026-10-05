# 🚀 Express.js API for the Zamana app

This document serves as a reference for the initial structure and configuration of an API or web application using **Express.js** and **Node.js**.

## App

To make sure implementation is right, you can check the app project at ```../zamana```.

## Guidelines

- TypeScript is the default.
- Update the .gitignore file if needed.
- Don't forget the unit tests after implementing a new endpoint.

---

## 📁 Project Structure

```text
my-express-project/
├── config/             # Configurations (database, environment variables)
├── controllers/        # Business logic for each route
├── middleware/         # Custom middlewares (auth, validation, etc.)
├── models/             # Data models (Mongoose, Sequelize, etc.)
├── routes/             # Endpoint definitions
├── .env                # Environment variables (ignored by Git)
├── .gitignore          # Files to be ignored by Git
├── app.js              # Express application configuration
├── server.js           # Entry point to start the server
└── package.json        # Project dependencies and scripts
```

---

## 🛠️ Initial Setup

### 1. Installing Dependencies
Run the following commands in your terminal to initialize the project and install essential packages:

```bash
# Initialize the project
npm init -y

# Production dependencies
npm install express dotenv cors helmet morgan

# Development dependencies
npm install --save-dev nodemon
```

### 2. Scripts in `package.json`
Add these scripts to easily launch your server:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 💻 Base Code

### `server.js` (Entry Point)
```javascript
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### `app.js` (Express Configuration)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Global Middlewares
app.use(helmet()); // Secures HTTP headers
app.use(cors()); // Enables CORS
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parses JSON payloads

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the Express API!" });
});

// 404 Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

module.exports = app;
```

### `.env` (Example)
```env
PORT=5000
NODE_ENV=development
```
