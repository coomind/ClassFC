const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT n.id, n.title, n.category, n.author_name AS author,
            DATE_FORMAT(n.created_at, '%Y-%m-%d') AS date,
            n.pinned, n.important, n.content,
            COUNT(c.id) AS commentCount
     FROM notices n LEFT JOIN comments c ON c.notice_id = n.id
     GROUP BY n.id
     ORDER BY n.pinned DESC, n.created_at DESC`
  );
  res.json(rows.map((r) => ({ ...r, pinned: !!r.pinned, important: !!r.important })));
});

router.get("/:id", async (req, res) => {
  const [[notice]] = await pool.query(
    `SELECT id, title, category, author_name AS author,
            DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
            pinned, important, content
     FROM notices WHERE id = ?`,
    [req.params.id]
  );
  if (!notice) return res.status(404).json({ error: "not found" });
  notice.pinned = !!notice.pinned;
  notice.important = !!notice.important;
  res.json(notice);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const { title, category, content, pinned, important } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: "missing fields" });
  const [r] = await pool.query(
    `INSERT INTO notices (title, category, author_id, author_name, content, pinned, important)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, category || "공지", req.user.id, req.user.name, content, !!pinned, !!important]
  );
  res.json({ id: r.insertId });
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const { title, category, content, pinned, important } = req.body || {};
  await pool.query(
    `UPDATE notices SET title = ?, category = ?, content = ?, pinned = ?, important = ?
     WHERE id = ?`,
    [title, category, content, !!pinned, !!important, req.params.id]
  );
  res.json({ ok: true });
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  await pool.query("DELETE FROM notices WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

router.get("/:id/comments", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, account_id AS accountId, author_name AS name, author_number AS number,
            text, DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS date
     FROM comments WHERE notice_id = ? ORDER BY created_at`,
    [req.params.id]
  );
  res.json(rows);
});

router.post("/:id/comments", auth, async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "text required" });

  const [[notice]] = await pool.query("SELECT category FROM notices WHERE id = ?", [req.params.id]);
  if (!notice) return res.status(404).json({ error: "notice not found" });
  if (notice.category === "공지")
    return res.status(403).json({ error: "공지사항에는 댓글을 작성할 수 없습니다" });

  const [r] = await pool.query(
    `INSERT INTO comments (notice_id, account_id, author_name, author_number, text)
     VALUES (?, ?, ?, ?, ?)`,
    [req.params.id, req.user.id, req.user.name, req.user.number, text.trim()]
  );
  res.json({ id: r.insertId });
});

router.delete("/:noticeId/comments/:id", auth, async (req, res) => {
  const [[c]] = await pool.query("SELECT account_id FROM comments WHERE id = ?", [req.params.id]);
  if (!c) return res.status(404).json({ error: "not found" });
  if (c.account_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "not your comment" });
  }
  await pool.query("DELETE FROM comments WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
