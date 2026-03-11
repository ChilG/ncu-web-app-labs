const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require("crypto");

// Create a new record
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const recordId = crypto.randomUUID();

  try {
    const [result] = await pool.query(
      `INSERT INTO records (record_id, title, content, version, valid_to, is_deleted) 
       VALUES (?, ?, ?, 1, NULL, FALSE)`,
      [recordId, title, content],
    );
    res.status(201).json({
      id: result.insertId,
      record_id: recordId,
      title,
      content,
      version: 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all active records (latest versions)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM records WHERE valid_to IS NULL AND is_deleted = FALSE ORDER BY created_at DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get full history of a specific record
router.get("/:record_id/history", async (req, res) => {
  const { record_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM records WHERE record_id = ? ORDER BY version DESC`,
      [record_id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get record at specific timestamp
router.get("/:record_id/at-time", async (req, res) => {
  const { record_id } = req.params;
  const { timestamp } = req.query; // e.g., ?timestamp=2024-01-01T12:00:00Z

  if (!timestamp) {
    return res
      .status(400)
      .json({ error: "Timestamp query parameter required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM records 
       WHERE record_id = ? 
         AND created_at <= ? 
         AND (valid_to > ? OR valid_to IS NULL)
       LIMIT 1`,
      [record_id, timestamp, timestamp],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Record not found at this timestamp" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update a record (Time-Travel variant)
router.put("/:record_id", async (req, res) => {
  const { record_id } = req.params;
  const { title, content } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Find current active record
    const [rows] = await connection.query(
      `SELECT * FROM records WHERE record_id = ? AND valid_to IS NULL FOR UPDATE`,
      [record_id],
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "Record not found or already deleted" });
    }

    const currentRecord = rows[0];

    // Mark current as historically invalid
    await connection.query(
      `UPDATE records SET valid_to = CURRENT_TIMESTAMP WHERE id = ?`,
      [currentRecord.id],
    );

    // Insert new version
    const newVersion = currentRecord.version + 1;
    const [insertResult] = await connection.query(
      `INSERT INTO records (record_id, title, content, version, valid_to, is_deleted) 
       VALUES (?, ?, ?, ?, NULL, ?)`,
      [
        record_id,
        title || currentRecord.title,
        content !== undefined ? content : currentRecord.content,
        newVersion,
        currentRecord.is_deleted,
      ],
    );

    await connection.commit();

    res.json({
      id: insertResult.insertId,
      record_id,
      title: title || currentRecord.title,
      content: content !== undefined ? content : currentRecord.content,
      version: newVersion,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Database error during update" });
  } finally {
    connection.release();
  }
});

// Delete a record (Soft delete)
router.delete("/:record_id", async (req, res) => {
  const { record_id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT * FROM records WHERE record_id = ? AND valid_to IS NULL FOR UPDATE`,
      [record_id],
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "Record not found or already deleted" });
    }

    const currentRecord = rows[0];

    // Mark current as historically invalid
    await connection.query(
      `UPDATE records SET valid_to = CURRENT_TIMESTAMP WHERE id = ?`,
      [currentRecord.id],
    );

    // Insert new version as deleted
    const newVersion = currentRecord.version + 1;
    await connection.query(
      `INSERT INTO records (record_id, title, content, version, valid_to, is_deleted) 
       VALUES (?, ?, ?, ?, NULL, TRUE)`,
      [record_id, currentRecord.title, currentRecord.content, newVersion],
    );

    await connection.commit();
    res.json({ message: "Record deleted" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Database error during deletion" });
  } finally {
    connection.release();
  }
});

// Rollback to a specific version
router.post("/:record_id/rollback/:version", async (req, res) => {
  const { record_id, version } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Find the version to rollback to
    const [targetRows] = await connection.query(
      `SELECT * FROM records WHERE record_id = ? AND version = ?`,
      [record_id, parseInt(version)],
    );

    if (targetRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Target version not found" });
    }

    const targetRecord = targetRows[0];

    // Find current active record to close it out
    const [currentRows] = await connection.query(
      `SELECT * FROM records WHERE record_id = ? AND valid_to IS NULL FOR UPDATE`,
      [record_id],
    );

    let nextVersion = 1;
    if (currentRows.length > 0) {
      const currentRecord = currentRows[0];
      await connection.query(
        `UPDATE records SET valid_to = CURRENT_TIMESTAMP WHERE id = ?`,
        [currentRecord.id],
      );
      nextVersion = currentRecord.version + 1;
    } else {
      // if all were closed out (e.g. no valid_to IS NULL active item), we need the max version
      const [maxRows] = await connection.query(
        `SELECT MAX(version) as maxVersion FROM records WHERE record_id = ?`,
        [record_id],
      );
      if (maxRows.length > 0 && maxRows[0].maxVersion) {
        nextVersion = maxRows[0].maxVersion + 1;
      }
    }

    // Insert the copied record as the new latest version
    const [insertResult] = await connection.query(
      `INSERT INTO records (record_id, title, content, version, valid_to, is_deleted) 
       VALUES (?, ?, ?, ?, NULL, FALSE)`,
      [record_id, targetRecord.title, targetRecord.content, nextVersion],
    );

    await connection.commit();
    res.json({
      message: `Rolled back to version ${version}`,
      new_version: nextVersion,
      record: {
        id: insertResult.insertId,
        record_id,
        title: targetRecord.title,
        content: targetRecord.content,
        version: nextVersion,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Database error during rollback" });
  } finally {
    connection.release();
  }
});

module.exports = router;
