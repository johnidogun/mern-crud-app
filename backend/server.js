require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");




const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));


app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("MERN CRUD API is running");
});

// Connect to MongoDb
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Task routes
app.use("/api/tasks", taskRoutes);

// Start server after connecting to MongoDB
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();