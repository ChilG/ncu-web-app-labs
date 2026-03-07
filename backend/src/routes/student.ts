import express, { Request, Response } from "express";
import { query } from "../connection/db";
import { ResultSetHeader } from "mysql2";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";
import crypto from "crypto";

const router = express.Router();

const StudentSchema = z.object({
  name: z.string().max(150),
  age: z.number().int().positive(),
  email: z.string().email().max(100),
  major: z.string().max(100),
});

router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const students = await query(
      "SELECT id, name, age, email, major FROM students",
    );
    res.json({ data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const validation = StudentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const { name, age, email, major } = validation.data;
    const id = crypto.randomUUID();

    await query(
      "INSERT INTO students (id, name, age, email, major) VALUES (?, ?, ?, ?, ?)",
      [id, name, age, email, major],
    );

    res.status(201).json({ id, name, age, email, major });
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ error: "Student with this email may already exist" });
      return;
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = StudentSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }

    const { name, age, email, major } = validation.data;

    const result = (await query(
      "UPDATE students SET name = ?, age = ?, email = ?, major = ? WHERE id = ?",
      [name, age, email, major, id],
    )) as ResultSetHeader;

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json({ id, name, age, email, major });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = (await query("DELETE FROM students WHERE id = ?", [
        id,
      ])) as ResultSetHeader;

      if (result.affectedRows === 0) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default router;
