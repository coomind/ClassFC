import { useState, useEffect } from "react";
import api from "../api";
import LineupPitch from "./LineupPitch";

function MatchCard({ match, user, members }) {
  const [rsvpList, setRsvpList] = useState([]);
  const [myRsvp, setMyRsvp] = useState(null);
  const [motmTally, setMotmTally] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [motmOpen, setMotmOpen] = useState(false);
  const [lineup, setLineup] = useState(null);
  const [lineupOpen, setLineupOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isFinished = match.status === "finished";

  // 경기 상태에 맞는 데이터 불러오기
  const loadAll = async () => {
    try {
      if (!isFinished) {
        const rsvp = await api.get(`/api/matches/${match.id}/rsvp`);
        setRsvpList(rsvp);

        if (user) {
          const mine = rsvp.find((item) => item.username === user.username);
          setMyRsvp(mine ? mine.status : null);
        }

        const lineupData = await api.get(`/api/matches/${match.id}/lineup`);
        setLineup(lineupData);
      } else {
        const motm = await api.get(`/api/matches/${match.id}/motm`);
        setMotmTally(motm.tally || []);
        setTotalVotes(motm.totalVotes || 0);
      }
    } catch (error) {
      setLineup(null);
    }
  };

  useEffect(() => {
    loadAll();
  }, [match.id, user && user.username]);

  const date = new Date(match.date);
  const dateLabel = `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];

  let resultTag = "";

  if (isFinished) {
    if (match.scoreOurs > match.scoreTheirs) {
      resultTag = "WIN";
    } else if (match.scoreOurs < match.scoreTheirs) {
      resultTag = "LOSS";
    } else {
      resultTag = "DRAW";
    }
  }

  const attendCount = rsvpList.filter((item) => item.status === "attend").length;
  const lateCount = rsvpList.filter((item) => item.status === "late").length;

  // 참석 또는 늦참 처리
  const handleRsvp = async (status) => {
    if (!user) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    setBusy(true);

    try {
      await api.post(`/api/matches/${match.id}/rsvp`, { status });
      await loadAll();
    } catch (error) {
      alert("처리 실패: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  // 참석 취소 처리
  const handleCancelRsvp = async () => {
    setBusy(true);

    try {
      await api.del(`/api/matches/${match.id}/rsvp`);
      await loadAll();
    } catch (error) {
      alert("처리 실패: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  let motmWinnerId = null;
  let motmMax = 0;

  // MOTM 최다 득표자 찾기
  for (const item of motmTally) {
    if (Number(item.votes) > motmMax) {
      motmWinnerId = item.memberId;
      motmMax = Number(item.votes);
    }
  }

  const motmPlayer = motmWinnerId
    ? members.find((member) => String(member.id) === String(motmWinnerId))
    : null;

  // MOTM 투표 처리
  const handleVoteMotm = async (memberId) => {
    if (!user) {
      alert("로그인 후 투표할 수 있습니다.");
      return;
    }

    setBusy(true);

    try {
      await api.post(`/api/matches/${match.id}/motm`, { memberId });
      await loadAll();
      setMotmOpen(false);
    } catch (error) {
      alert("투표 실패: " + error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`match-card card-fc ${isFinished ? "is-finished" : ""}`}>
      <div className="match-card-top">
        <div className="match-date-block">
          <div className="match-date-big">{dateLabel}</div>
          <div className="match-date-day">
            {dayOfWeek}요일 · {match.time}
          </div>
        </div>

        <div className="match-tags">
          <span className={`match-type-tag type-${match.type.toLowerCase()}`}>
            {match.type}
          </span>

          {isFinished && (
            <span className={`match-result-tag result-${resultTag.toLowerCase()}`}>
              {resultTag}
            </span>
          )}

          {!isFinished && <span className="match-upcoming-tag">UPCOMING</span>}
        </div>
      </div>

      <div className="match-teams">
        <div className="match-team-home">
          <div className="match-team-name">CLASS FC</div>
          <div className="match-team-sub">SW</div>
        </div>

        <div className="match-vs">
          {isFinished ? (
            <div className="match-score">
              <span className="score-ours">{match.scoreOurs}</span>
              <span className="score-dash">:</span>
              <span className="score-theirs">{match.scoreTheirs}</span>
            </div>
          ) : (
            <div className="match-vs-text">VS</div>
          )}
        </div>

        <div className="match-team-away">
          <div className="match-team-name">{match.opponent}</div>
          <div className="match-team-sub">{match.opponentDept}</div>
        </div>
      </div>

      <div className="match-venue">
        <span className="venue-pin">●</span> {match.venue}
        <span className="venue-side">
          {match.homeAway === "home" ? "HOME" : "AWAY"}
        </span>
      </div>

      {/* 공식 라인업 */}
      {!isFinished && lineup && (
        <div className="match-lineup-block">
          <button
            className="lineup-toggle-btn"
            onClick={() => setLineupOpen(!lineupOpen)}
          >
            <span className="lineup-toggle-icon">📋</span>
            공식 라인업 {lineup.formation}
            <span className="lineup-toggle-arrow">
              {lineupOpen ? "▲" : "▼"}
            </span>
          </button>

          {lineupOpen && <LineupPitch lineup={lineup} members={members} />}
        </div>
      )}

      {/* 참석 체크 */}
      {!isFinished && (
        <div className="match-rsvp">
          <div className="rsvp-counts">
            <span className="rsvp-count-ok">참석 {attendCount}</span>
            <span className="rsvp-count-late">늦참 {lateCount}</span>
          </div>

          <div className="rsvp-actions">
            <button
              className={myRsvp === "attend" ? "rsvp-btn active" : "rsvp-btn"}
              onClick={() => handleRsvp("attend")}
              disabled={busy}
            >
              참석
            </button>

            <button
              className={myRsvp === "late" ? "rsvp-btn late active" : "rsvp-btn late"}
              onClick={() => handleRsvp("late")}
              disabled={busy}
            >
              늦참
            </button>

            {myRsvp && (
              <button
                className="rsvp-cancel-btn"
                onClick={handleCancelRsvp}
                disabled={busy}
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}

      {/* 경기 종료 후 MOTM */}
      {isFinished && (
        <div className="match-motm">
          {motmPlayer ? (
            <div className="motm-winner-row">
              <span className="motm-icon">★</span>
              <span className="motm-label">MOTM</span>
              <span className="motm-name">
                #{motmPlayer.number} {motmPlayer.name}
              </span>
              <span className="motm-votes">
                ({motmMax}/{totalVotes}표)
              </span>
            </div>
          ) : (
            <div className="motm-empty">아직 MOTM 투표가 없습니다</div>
          )}

          {!motmOpen ? (
            <button className="motm-vote-btn" onClick={() => setMotmOpen(true)}>
              MOTM 투표하기
            </button>
          ) : (
            <div className="motm-vote-panel">
              <div className="motm-panel-title">베스트 선수를 선택하세요</div>

              <div className="motm-player-list">
                {members.map((member) => (
                  <button
                    key={member.id}
                    className="motm-pick"
                    onClick={() => handleVoteMotm(member.id)}
                    disabled={busy}
                  >
                    <span className="motm-pick-num">#{member.number}</span>
                    <span className="motm-pick-name">{member.name}</span>
                    <span className="motm-pick-pos">{member.position}</span>
                  </button>
                ))}
              </div>

              <button
                className="motm-close-btn"
                onClick={() => setMotmOpen(false)}
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchCard;
