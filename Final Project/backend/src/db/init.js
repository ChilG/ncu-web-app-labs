const pool = require("../db");

async function initDb() {
  try {
    console.log("Initializing database tables...");

    // Create records table for Type 2 Slowly Changing Dimension
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records (
          id INT AUTO_INCREMENT PRIMARY KEY,
          record_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          version INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
          valid_to TIMESTAMP(3) NULL,
          is_deleted BOOLEAN DEFAULT FALSE,
          INDEX idx_record_id (record_id),
          INDEX idx_valid_to (valid_to)
      );
    `);

    console.log("Database tables verified/created successfully.");
    // We don't exit the process here so that the server can keep running
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

module.exports = initDb;
