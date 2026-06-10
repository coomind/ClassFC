const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");
const router = express.Router();

router.use(auth, adminOnly);

// 승인된 계정만
router.get("/accounts", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, username, name, number, role, status,
            DATE_FORMAT(joined_at, '%Y-%m-%dT%H:%i:%s') AS joinedAt
     FROM accounts WHERE status = 'approved' ORDER BY joined_at DESC`
  );
  res.json(rows);
});

// 승인 대기 목록
router.get("/pending-accounts", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, username, name, number, year, position,
            DATE_FORMAT(joined_at, '%Y-%m-%dT%H:%i:%s') AS joinedAt
     FROM accounts WHERE status = 'pending' ORDER BY joined_at`
  );
  res.json(rows);
});

// 승인 > 상태 변경 + 선수단 자동 등록
router.post("/accounts/:id/approve", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[a]] = await conn.query(
      "SELECT id, name, number, year, position FROM accounts WHERE id = ? AND status = 'pending'",
      [req.params.id]
    );
    if (!a) {
      await conn.rollback();
      return res.status(404).json({ error: "pending account not found" });
    }

    await conn.query("UPDATE accounts SET status = 'approved' WHERE id = ?", [req.params.id]);

    await conn.query(
      `INSERT INTO members (account_id, number, name, position, role, year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [a.id, Number(a.number), a.name, a.position, "Member", a.year]
    );

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// 거절 → 대기 계정 삭제
router.post("/accounts/:id/reject", async (req, res) => {
  await pool.query("DELETE FROM accounts WHERE id = ? AND status = 'pending'", [req.params.id]);
  res.json({ ok: true });
});

router.delete("/accounts/:id", async (req, res) => {
  await pool.query("DELETE FROM accounts WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

router.put("/accounts/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (role !== "admin" && role !== "member") return res.status(400).json({ error: "invalid role" });
  await pool.query("UPDATE accounts SET role = ? WHERE id = ?", [role, req.params.id]);
  res.json({ ok: true });
});

router.get("/rsvp-summary", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.match_id AS matchId, r.status, a.name, a.number, a.username
     FROM rsvp r JOIN accounts a ON a.id = r.account_id`
  );
  const byMatch = {};
  for (const r of rows) {
    if (!byMatch[r.matchId]) byMatch[r.matchId] = { attend: [], late: [] };
    byMatch[r.matchId][r.status].push({ name: r.name, number: r.number, username: r.username });
  }
  res.json(byMatch);
});

module.exports = router;
