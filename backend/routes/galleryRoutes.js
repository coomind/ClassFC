const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, tag, image_url AS imageUrl, media_type AS mediaType,
            gradient, icon, DATE_FORMAT(taken_date, '%Y-%m-%d') AS date
     FROM gallery ORDER BY taken_date DESC, id DESC`
  );
  res.json(rows);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const { title, tag, imageUrl, mediaType, gradient, icon, date } = req.body || {};
  const mt = mediaType === "youtube" ? "youtube" : "image";
  const [r] = await pool.query(
    `INSERT INTO gallery (title, tag, image_url, media_type, gradient, icon, taken_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, tag || "Match", imageUrl || null, mt, gradient || null, icon || null, date || null]
  );
  res.json({ id: r.insertId });
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  await pool.query("DELETE FROM gallery WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
