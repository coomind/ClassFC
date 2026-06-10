const express = require("express");
const { pool } = require("../db");
const { auth, adminOnly } = require("../auth");

const router = express.Router();

// 해당 경기 라인업에 들어간 선수 id 목록
async function lineupMemberIds(conn, matchId) {
  const [[lineup]] = await conn.query("SELECT id FROM lineups WHERE match_id = ?", [matchId]);
  if (!lineup) {
    return [];
  }
  const [slots] = await conn.query(
    "SELECT DISTINCT member_id FROM lineup_slots WHERE lineup_id = ?",
    [lineup.id]
  );
  return slots.map((slot) => {
    return slot.member_id;
  });
}

// 라인업 선수들의 출전 횟수(matches_played)를 ±1 (0 미만으로는 안 내려감)
async function bumpAppearances(conn, matchId, delta) {
  const ids = await lineupMemberIds(conn, matchId);
  if (ids.length === 0) {
    return false;
  }
  if (delta > 0) {
    await conn.query("UPDATE members SET matches_played = matches_played + 1 WHERE id IN (?)", [
      ids,
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

// 경기 등록 — 관리자만
router.post("/", auth, adminOnly, async (req, res) => {
  const body = req.body || {};
  const [result] = await pool.query(
    `INSERT INTO matches
     (match_date, match_time, opponent, opponent_dept, venue, match_type, sport, status, home_away, score_ours, score_theirs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.date,
      body.time,
      body.opponent,
      body.opponentDept || null,
      body.venue || null,
      body.type || "League",
      body.sport || "football",
      body.status || "upcoming",
      body.homeAway || "home",
      body.scoreOurs == null ? null : body.scoreOurs,
      body.scoreTheirs == null ? null : body.scoreTheirs,
    ]
  );
  res.json({ id: result.insertId });
});

// 경기 수정 — 관리자만, 상태 전환에 따라 출전 횟수 보정
router.put("/:id", auth, adminOnly, async (req, res) => {
  const body = req.body || {};
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
        body.date,
        body.time,
        body.opponent,
        body.opponentDept || null,
        body.venue || null,
        body.type,
        body.sport || "football",
        body.status,
        body.homeAway,
        body.scoreOurs == null ? null : body.scoreOurs,
        body.scoreTheirs == null ? null : body.scoreTheirs,
        req.params.id,
      ]
    );

    const wasFinished = before.status === "finished";
    const nowFinished = body.status === "finished";

    // upcoming → finished 로 바뀌면 출전 +1, 되돌리면 -1 (중복 카운트는 appearance_counted로 방지)
    if (!wasFinished && nowFinished && !before.appearance_counted) {
      const counted = await bumpAppearances(conn, req.params.id, 1);
      if (counted) {
        await conn.query("UPDATE matches SET appearance_counted = TRUE WHERE id = ?", [
          req.params.id,
        ]);
      }
    } else if (wasFinished && !nowFinished && before.appearance_counted) {
      const counted = await bumpAppearances(conn, req.params.id, -1);
      if (counted) {
        await conn.query("UPDATE matches SET appearance_counted = FALSE WHERE id = ?", [
          req.params.id,
        ]);
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 경기 삭제 — 집계된 출전 기록이 있으면 먼저 되돌리고 삭제
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
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
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

// 참석 응답 — 같은 사람이 다시 누르면 상태만 갱신(UPSERT)
router.post("/:id/rsvp", auth, async (req, res) => {
  const { status } = req.body || {};
  if (status !== "attend" && status !== "late") {
    return res.status(400).json({ error: "invalid status" });
  }
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
    req.user.id,
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
  for (const row of rows) {
    total += Number(row.votes);
  }
  res.json({ tally: rows, totalVotes: total });
});

// MOTM 투표 — 한 사람당 한 표, 다시 투표하면 대상만 변경(UPSERT)
router.post("/:id/motm", auth, async (req, res) => {
  const { memberId } = req.body || {};
  if (!memberId) {
    return res.status(400).json({ error: "memberId required" });
  }
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
  if (!lineup) {
    return res.json(null);
  }
  const [slots] = await pool.query(
    "SELECT slot_id, member_id FROM lineup_slots WHERE lineup_id = ?",
    [lineup.id]
  );
  // slot_id → member_id 형태로 펼치기
  const assignments = {};
  slots.forEach((slot) => {
    assignments[slot.slot_id] = slot.member_id;
  });

  let publishedByName = null;
  if (lineup.publishedBy) {
    const [[account]] = await pool.query("SELECT name FROM accounts WHERE id = ?", [
      lineup.publishedBy,
    ]);
    publishedByName = account ? account.name : null;
  }

  res.json({
    type: lineup.type,
    formation: lineup.formation,
    assignments: assignments,
    publishedBy: publishedByName,
    publishedAt: lineup.publishedAt,
  });
});

// 라인업 저장 — 관리자만. 재등록 시 기존 출전 카운트를 롤백 후 다시 반영
router.post("/:id/lineup", auth, adminOnly, async (req, res) => {
  const { type, formation, assignments } = req.body || {};
  if (!formation || !assignments) {
    return res.status(400).json({ error: "missing fields" });
  }

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
      req.params.id,
    ]);

    // 이미 집계된 경기의 라인업을 교체하는 경우 → 기존 선수들 출전 -1 후 플래그 해제
    if (match.status === "finished" && match.appearance_counted && existing) {
      const [oldSlots] = await conn.query(
        "SELECT DISTINCT member_id FROM lineup_slots WHERE lineup_id = ?",
        [existing.id]
      );
      if (oldSlots.length) {
        await conn.query(
          "UPDATE members SET matches_played = GREATEST(matches_played - 1, 0) WHERE id IN (?)",
          [oldSlots.map((slot) => slot.member_id)]
        );
      }
      await conn.query("UPDATE matches SET appearance_counted = FALSE WHERE id = ?", [
        req.params.id,
      ]);
    }

    // 기존 라인업 제거 후 새로 삽입
    if (existing) {
      await conn.query("DELETE FROM lineup_slots WHERE lineup_id = ?", [existing.id]);
      await conn.query("DELETE FROM lineups WHERE id = ?", [existing.id]);
    }

    const [result] = await conn.query(
      "INSERT INTO lineups (match_id, lineup_type, formation, published_by) VALUES (?, ?, ?, ?)",
      [req.params.id, type || "football", formation, req.user.id]
    );
    const rows = Object.entries(assignments).map(([slotId, memberId]) => {
      return [result.insertId, slotId, memberId];
    });
    if (rows.length) {
      await conn.query("INSERT INTO lineup_slots (lineup_id, slot_id, member_id) VALUES ?", [rows]);
    }

    // 이미 끝난 경기에 라인업을 새로 넣으면 출전 +1 (중복 인원 제외)
    if (match.status === "finished") {
      const uniqueIds = [...new Set(Object.values(assignments).map(Number))];
      if (uniqueIds.length) {
        await conn.query("UPDATE members SET matches_played = matches_played + 1 WHERE id IN (?)", [
          uniqueIds,
        ]);
      }
      await conn.query("UPDATE matches SET appearance_counted = TRUE WHERE id = ?", [
        req.params.id,
      ]);
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 라인업 삭제 — 관리자만. 집계된 출전 기록이 있으면 되돌리고 삭제
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
        req.params.id,
      ]);
    }
    await conn.query("DELETE FROM lineups WHERE match_id = ?", [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
