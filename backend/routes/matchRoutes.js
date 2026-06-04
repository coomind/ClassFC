const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");

const router = express.Router();

async function lineupMemberIds(conn, matchId) {
  const [[lineup]] = await conn.query("SELECT id FROM lineups WHERE match_id = ?", [matchId]);
  if (!lineup) return [];
  const [slots] = await conn.query(
    "SELECT DISTINCT member_id FROM lineup_slots WHERE lineup_id = ?",
    [lineup.id]
  );
  return slots.map((s) => s.member_id);
}

async function bumpAppearances(conn, matchId, delta) {
  const ids = await lineupMemberIds(conn, matchId);
  if (ids.length === 0) return false;
  if (delta > 0) {
    await conn.query("UPDATE members SET matches_played = matches_played + 1 WHERE id IN (?)", [
      ids
    ]);
  } else {
    await conn.query(
      "UPDATE members SET matches_played = GREATEST(matches_played - 1, 0) WHERE id IN (?)",
      [ids]
    );
  }
  return true;
}

router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, DATE_FORMAT(match_date, '%Y-%m-%d') AS date,
            TIME_FORMAT(match_time, '%H:%i') AS time,
            opponent, opponent_dept AS opponentDept, venue,
            match_type AS type, sport, status, home_away AS homeAway,
            score_ours AS scoreOurs, score_theirs AS scoreTheirs
     FROM matches ORDER BY match_date`
  );
  res.json(rows);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const m = req.body || {};
  const [r] = await pool.query(
    `INSERT INTO matches
     (match_date, match_time, opponent, opponent_dept, venue, match_type, sport, status, home_away, score_ours, score_theirs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      m.date,
      m.time,
      m.opponent,
      m.opponentDept || null,
      m.venue || null,
      m.type || "League",
      m.sport || "football",
      m.status || "upcoming",
      m.homeAway || "home",
      m.scoreOurs == null ? null : m.scoreOurs,
      m.scoreTheirs == null ? null : m.scoreTheirs
    ]
  );
  res.json({ id: r.insertId });
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const m = req.body || {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[before]] = await conn.query(
      "SELECT status, appearance_counted FROM matches WHERE id = ?",
      [req.params.id]
    );
    if (!before) {
      await conn.rollback();
      return res.status(404).json({ error: "not found" });
    }

    await conn.query(
      `UPDATE matches SET
         match_date = ?, match_time = ?, opponent = ?, opponent_dept = ?, venue = ?,
         match_type = ?, sport = ?, status = ?, home_away = ?, score_ours = ?, score_theirs = ?
       WHERE id = ?`,
      [
        m.date,
        m.time,
        m.opponent,
        m.opponentDept || null,
        m.venue || null,
        m.type,
        m.sport || "football",
        m.status,
        m.homeAway,
        m.scoreOurs == null ? null : m.scoreOurs,
        m.scoreTheirs == null ? null : m.scoreTheirs,
        req.params.id
      ]
    );

    const wasFinished = before.status === "finished";
    const nowFinished = m.status === "finished";

    if (!wasFinished && nowFinished && !before.appearance_counted) {
      const counted = await bumpAppearances(conn, req.params.id, 1);
      if (counted) {
        await conn.query("UPDATE matches SET appearance_counted = TRUE WHERE id = ?", [
          req.params.id
        ]);
      }
    } else if (wasFinished && !nowFinished && before.appearance_counted) {
      const counted = await bumpAppearances(conn, req.params.id, -1);
      if (counted) {
        await conn.query("UPDATE matches SET appearance_counted = FALSE WHERE id = ?", [
          req.params.id
        ]);
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[match]] = await conn.query(
      "SELECT status, appearance_counted FROM matches WHERE id = ?",
      [req.params.id]
    );
    if (match && match.status === "finished" && match.appearance_counted) {
      await bumpAppearances(conn, req.params.id, -1);
    }
    await conn.query("DELETE FROM matches WHERE id = ?", [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.get("/:id/rsvp", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.status, a.name, a.number, a.username
     FROM rsvp r JOIN accounts a ON a.id = r.account_id
     WHERE r.match_id = ?`,
    [req.params.id]
  );
  res.json(rows);
});

router.post("/:id/rsvp", auth, async (req, res) => {
  const { status } = req.body || {};
  if (status !== "attend" && status !== "late")
    return res.status(400).json({ error: "invalid status" });
  await pool.query(
    `INSERT INTO rsvp (match_id, account_id, status) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [req.params.id, req.user.id, status]
  );
  res.json({ ok: true });
});

router.delete("/:id/rsvp", auth, async (req, res) => {
  await pool.query("DELETE FROM rsvp WHERE match_id = ? AND account_id = ?", [
    req.params.id,
    req.user.id
  ]);
  res.json({ ok: true });
});

router.get("/:id/motm", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT voted_member_id AS memberId, COUNT(*) AS votes
     FROM motm_votes WHERE match_id = ?
     GROUP BY voted_member_id ORDER BY votes DESC`,
    [req.params.id]
  );
  let total = 0;
  for (const r of rows) total += Number(r.votes);
  res.json({ tally: rows, totalVotes: total });
});

router.post("/:id/motm", auth, async (req, res) => {
  const { memberId } = req.body || {};
  if (!memberId) return res.status(400).json({ error: "memberId required" });
  await pool.query(
    `INSERT INTO motm_votes (match_id, voter_account_id, voted_member_id) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE voted_member_id = VALUES(voted_member_id)`,
    [req.params.id, req.user.id, memberId]
  );
  res.json({ ok: true });
});

router.get("/:id/lineup", async (req, res) => {
  const [[lineup]] = await pool.query(
    `SELECT id, lineup_type AS type, formation, published_by AS publishedBy,
            DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s') AS publishedAt
     FROM lineups WHERE match_id = ?`,
    [req.params.id]
  );
  if (!lineup) return res.json(null);
  const [slots] = await pool.query(
    "SELECT slot_id, member_id FROM lineup_slots WHERE lineup_id = ?",
    [lineup.id]
  );
  const assignments = {};
  slots.forEach((s) => {
    assignments[s.slot_id] = s.member_id;
  });

  let publishedByName = null;
  if (lineup.publishedBy) {
    const [[a]] = await pool.query("SELECT name FROM accounts WHERE id = ?", [lineup.publishedBy]);
    publishedByName = a ? a.name : null;
  }

  res.json({
    type: lineup.type,
    formation: lineup.formation,
    assignments: assignments,
    publishedBy: publishedByName,
    publishedAt: lineup.publishedAt
  });
});

router.post("/:id/lineup", auth, adminOnly, async (req, res) => {
  const { type, formation, assignments } = req.body || {};
  if (!formation || !assignments) return res.status(400).json({ error: "missing fields" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[match]] = await conn.query(
      "SELECT status, appearance_counted FROM matches WHERE id = ?",
      [req.params.id]
    );
    if (!match) {
      await conn.rollback();
      return res.status(404).json({ error: "match not found" });
    }

    const [[existing]] = await conn.query("SELECT id FROM lineups WHERE match_id = ?", [
      req.params.id
    ]);

    if (match.status === "finished" && match.appearance_counted && existing) {
      const [oldSlots] = await conn.query(
        "SELECT DISTINCT member_id FROM lineup_slots WHERE lineup_id = ?",
        [existing.id]
      );
      if (oldSlots.length) {
        await conn.query(
          "UPDATE members SET matches_played = GREATEST(matches_played - 1, 0) WHERE id IN (?)",
          [oldSlots.map((s) => s.member_id)]
        );
      }
      await conn.query("UPDATE matches SET appearance_counted = FALSE WHERE id = ?", [
        req.params.id
      ]);
    }

    if (existing) {
      await conn.query("DELETE FROM lineup_slots WHERE lineup_id = ?", [existing.id]);
      await conn.query("DELETE FROM lineups WHERE id = ?", [existing.id]);
    }

    const [r] = await conn.query(
      "INSERT INTO lineups (match_id, lineup_type, formation, published_by) VALUES (?, ?, ?, ?)",
      [req.params.id, type || "football", formation, req.user.id]
    );
    const rows = Object.entries(assignments).map(([sid, mid]) => [r.insertId, sid, mid]);
    if (rows.length) {
      await conn.query("INSERT INTO lineup_slots (lineup_id, slot_id, member_id) VALUES ?", [rows]);
    }

    if (match.status === "finished") {
      const uniqueIds = [...new Set(Object.values(assignments).map(Number))];
      if (uniqueIds.length) {
        await conn.query("UPDATE members SET matches_played = matches_played + 1 WHERE id IN (?)", [
          uniqueIds
        ]);
      }
      await conn.query("UPDATE matches SET appearance_counted = TRUE WHERE id = ?", [
        req.params.id
      ]);
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.delete("/:id/lineup", auth, adminOnly, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[match]] = await conn.query(
      "SELECT status, appearance_counted FROM matches WHERE id = ?",
      [req.params.id]
    );
    if (match && match.status === "finished" && match.appearance_counted) {
      await bumpAppearances(conn, req.params.id, -1);
      await conn.query("UPDATE matches SET appearance_counted = FALSE WHERE id = ?", [
        req.params.id
      ]);
    }
    await conn.query("DELETE FROM lineups WHERE match_id = ?", [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
