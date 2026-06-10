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
    const [[account]] = await conn.query(
      "SELECT id, name, number, year, position FROM accounts WHERE id = ? AND status = 'pending'",
      [req.params.id]
    );
    if (!account) {
      await conn.rollback();
      return res.status(404).json({ error: "pending account not found" });
    }
    // 상태를 approved로 바꾸고, 같은 정보로 members에도 등록
    await conn.query("UPDATE accounts SET status = 'approved' WHERE id = ?", [req.params.id]);
    await conn.query(
      `INSERT INTO members (account_id, number, name, position, role, year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [account.id, Number(account.number), account.name, account.position, "Member", account.year]
    );
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
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
  if (role !== "admin" && role !== "member") {
    return res.status(400).json({ error: "invalid role" });
  }
  await pool.query("UPDATE accounts SET role = ? WHERE id = ?", [role, req.params.id]);
  res.json({ ok: true });
});

router.get("/rsvp-summary", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.match_id AS matchId, r.status, a.name, a.number, a.username
     FROM rsvp r JOIN accounts a ON a.id = r.account_id`
  );
  // 경기별로 attend / late 명단을 묶기
  const byMatch = {};
  for (const row of rows) {
    if (!byMatch[row.matchId]) {
      byMatch[row.matchId] = { attend: [], late: [] };
    }
    byMatch[row.matchId][row.status].push({
      name: row.name,
      number: row.number,
      username: row.username,
    });
  }
  res.json(byMatch);
});

module.exports = router;
