const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");
const router = express.Router();

router.get("/", async (req, res) => {
  const [members] = await pool.query(
    `SELECT id, number, name, name_en AS nameEn, position, role, year,
            goals, assists, clean_sheets AS cleanSheets, matches_played AS matches, bio
     FROM members ORDER BY number`
  );
  const [motmRows] = await pool.query(
    `SELECT voted_member_id, match_id, COUNT(*) AS votes
     FROM motm_votes GROUP BY voted_member_id, match_id`
  );
  // 경기별 최다 득표자(MOTM) 추리기
  const motmByMatch = {};
  for (const row of motmRows) {
    if (!motmByMatch[row.match_id]) {
      motmByMatch[row.match_id] = { winner: null, max: 0 };
    }
    if (row.votes > motmByMatch[row.match_id].max) {
      motmByMatch[row.match_id] = { winner: row.voted_member_id, max: row.votes };
    }
  }
  // 선수별 MOTM 횟수 합산
  const motmCounts = {};
  for (const matchId in motmByMatch) {
    const winner = motmByMatch[matchId].winner;
    motmCounts[winner] = (motmCounts[winner] || 0) + 1;
  }
  const enriched = members.map((member) => {
    return { ...member, motm: motmCounts[member.id] || 0 };
  });
  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, number, name, name_en AS nameEn, position, role, year,
            goals, assists, clean_sheets AS cleanSheets, matches_played AS matches, bio
     FROM members WHERE id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(rows[0]);
});

// 선수 등록 - 관리자만
router.post("/", auth, adminOnly, async (req, res) => {
  const { number, name, nameEn, position, role, year, bio, goals, assists, cleanSheets, matches } =
    req.body || {};
  const [result] = await pool.query(
    `INSERT INTO members (number, name, name_en, position, role, year, goals, assists, clean_sheets, matches_played, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      number,
      name,
      nameEn || null,
      position,
      role || "Member",
      year || null,
      goals || 0,
      assists || 0,
      cleanSheets || 0,
      matches || 0,
      bio || null,
    ]
  );
  res.json({ id: result.insertId });
});

// 선수 수정 — 관리자만, 전달된 필드만 부분 업데이트
router.put("/:id", auth, adminOnly, async (req, res) => {
  const fields = [
    "number",
    "name",
    "name_en",
    "position",
    "role",
    "year",
    "goals",
    "assists",
    "clean_sheets",
    "matches_played",
    "bio",
  ];
  const body = req.body || {};
  // DB 컬럼명 ↔ API 필드명 매핑
  const map = { name_en: "nameEn", matches_played: "matches", clean_sheets: "cleanSheets" };
  const sets = [];
  const values = [];
  for (const field of fields) {
    const key = map[field] || field;
    if (body[key] !== undefined) {
      sets.push(field + " = ?");
      values.push(body[key]);
    }
  }
  if (sets.length === 0) {
    return res.status(400).json({ error: "nothing to update" });
  }
  values.push(req.params.id);
  await pool.query("UPDATE members SET " + sets.join(", ") + " WHERE id = ?", values);
  res.json({ ok: true });
});

// 선수 삭제 — 관리자만
router.delete("/:id", auth, adminOnly, async (req, res) => {
  await pool.query("DELETE FROM members WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
