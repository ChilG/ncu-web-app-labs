const express = require("express");
const cors = require("cors");
const recordsRoutes = require("./routes/records");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/records", recordsRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
