import { useState } from "react";
import MatchCard from "../components/MatchCard";
import "../styles/schedule.css";

function Schedule({ matches, user, members }) {
  const [tab, setTab] = useState("upcoming");
  const [sport, setSport] = useState("all");

  const sportList = [
    { id: "all", label: "전체" },
    { id: "football", label: "⚽ 축구" },
    { id: "futsal", label: "🤾 풋살" },
  ];

  const isSameSport = (match) => {
    return sport === "all" || (match.sport || "football") === sport;
  };

  const upcomingMatches = matches
    .filter((match) => match.status === "upcoming")
    .filter(isSameSport)
    .sort((a, b) => a.date.localeCompare(b.date));

  const finishedMatches = matches
    .filter((match) => match.status === "finished")
    .filter(isSameSport)
    .sort((a, b) => b.date.localeCompare(a.date));

  const winCount = finishedMatches.filter((match) => {
    return match.scoreOurs > match.scoreTheirs;
  }).length;

  const drawCount = finishedMatches.filter((match) => {
    return match.scoreOurs === match.scoreTheirs;
  }).length;

  const lossCount = finishedMatches.filter((match) => {
    return match.scoreOurs < match.scoreTheirs;
  }).length;

  const goalsFor = finishedMatches.reduce((sum, match) => {
    return sum + (match.scoreOurs || 0);
  }, 0);

  const goalsAgainst = finishedMatches.reduce((sum, match) => {
    return sum + (match.scoreTheirs || 0);
  }, 0);

  const matchList = tab === "upcoming" ? upcomingMatches : finishedMatches;

  return (
    <div className="container page-section schedule-page">
      <div className="section-subtitle">FIXTURES</div>
      <h2 className="section-title">경기 일정</h2>

      {/* 종목 필터 */}
      <div className="sport-filter-row">
        {sportList.map((item) => (
          <button
            key={item.id}
            className={sport === item.id ? "sport-filter-btn active" : "sport-filter-btn"}
            onClick={() => setSport(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 경기 통계 */}
      <div className="schedule-stats-row">
        <div className="schedule-stat-card">
          <div className="ss-num">{upcomingMatches.length}</div>
          <div className="ss-label">UPCOMING</div>
        </div>

        <div className="schedule-stat-card">
          <div className="ss-num">{finishedMatches.length}</div>
          <div className="ss-label">PLAYED</div>
        </div>

        <div className="schedule-stat-card">
          <div className="ss-num green-accent">{winCount}W</div>
          <div className="ss-label">WINS</div>
        </div>

        <div className="schedule-stat-card">
          <div className="ss-num">{drawCount}D</div>
          <div className="ss-label">DRAWS</div>
        </div>

        <div className="schedule-stat-card">
          <div className="ss-num text-danger">{lossCount}L</div>
          <div className="ss-label">LOSSES</div>
        </div>

        <div className="schedule-stat-card">
          <div className="ss-num">
            {goalsFor} : {goalsAgainst}
          </div>
          <div className="ss-label">GOALS</div>
        </div>
      </div>

      {/* 일정 탭 */}
      <div className="schedule-tabs">
        <button
          className={tab === "upcoming" ? "sched-tab active" : "sched-tab"}
          onClick={() => setTab("upcoming")}
        >
          UPCOMING ({upcomingMatches.length})
        </button>

        <button
          className={tab === "finished" ? "sched-tab active" : "sched-tab"}
          onClick={() => setTab("finished")}
        >
          RESULTS ({finishedMatches.length})
        </button>
      </div>

      <div className="row g-4">
        {matchList.map((match) => (
          <div className="col-lg-6" key={match.id}>
            <MatchCard match={match} user={user} members={members} />
          </div>
        ))}
      </div>

      {matchList.length === 0 && (
        <div className="schedule-empty">
          {tab === "upcoming" ? "예정된 경기가 없습니다." : "진행된 경기가 없습니다."}
        </div>
      )}
    </div>
  );
}

export default Schedule;

/*
import { useState } from "react";
import MatchCard from "../components/MatchCard";
import "../styles/schedule.css";

function Schedule({ matches, user, members }) {
  const [tab, setTab] = useState("upcoming");
  const [sport, setSport] = useState("all");

  const bySport = (m) => sport === "all" || (m.sport || "football") === sport;

  const upcoming = matches
    .filter((m) => m.status === "upcoming")
    .filter(bySport)
    .sort((a, b) => a.date.localeCompare(b.date));

  const finished = matches
    .filter((m) => m.status === "finished")
    .filter(bySport)
    .sort((a, b) => b.date.localeCompare(a.date));

  const winCount = finished.filter((m) => m.scoreOurs > m.scoreTheirs).length;
  const drawCount = finished.filter((m) => m.scoreOurs === m.scoreTheirs).length;
  const lossCount = finished.filter((m) => m.scoreOurs < m.scoreTheirs).length;
  const goalsFor = finished.reduce((s, m) => s + (m.scoreOurs || 0), 0);
  const goalsAgainst = finished.reduce((s, m) => s + (m.scoreTheirs || 0), 0);

  const list = tab === "upcoming" ? upcoming : finished;

  return (
    <div className="container page-section schedule-page">
      <div className="section-subtitle">FIXTURES</div>
      <h2 className="section-title">경기 일정</h2>

      <div className="sport-filter-row">
        <button
          className={sport === "all" ? "sport-filter-btn active" : "sport-filter-btn"}
          onClick={() => setSport("all")}
        >
          전체
        </button>
        <button
          className={sport === "football" ? "sport-filter-btn active" : "sport-filter-btn"}
          onClick={() => setSport("football")}
        >
          ⚽ 축구
        </button>
        <button
          className={sport === "futsal" ? "sport-filter-btn active" : "sport-filter-btn"}
          onClick={() => setSport("futsal")}
        >
          🤾 풋살
        </button>
      </div>

      <div className="schedule-stats-row">
        <div className="schedule-stat-card">
          <div className="ss-num">{upcoming.length}</div>
          <div className="ss-label">UPCOMING</div>
        </div>
        <div className="schedule-stat-card">
          <div className="ss-num">{finished.length}</div>
          <div className="ss-label">PLAYED</div>
        </div>
        <div className="schedule-stat-card">
          <div className="ss-num green-accent">{winCount}W</div>
          <div className="ss-label">WINS</div>
        </div>
        <div className="schedule-stat-card">
          <div className="ss-num">{drawCount}D</div>
          <div className="ss-label">DRAWS</div>
        </div>
        <div className="schedule-stat-card">
          <div className="ss-num text-danger">{lossCount}L</div>
          <div className="ss-label">LOSSES</div>
        </div>
        <div className="schedule-stat-card">
          <div className="ss-num">
            {goalsFor} : {goalsAgainst}
          </div>
          <div className="ss-label">GOALS</div>
        </div>
      </div>

      <div className="schedule-tabs">
        <button
          className={tab === "upcoming" ? "sched-tab active" : "sched-tab"}
          onClick={() => setTab("upcoming")}
        >
          UPCOMING ({upcoming.length})
        </button>
        <button
          className={tab === "finished" ? "sched-tab active" : "sched-tab"}
          onClick={() => setTab("finished")}
        >
          RESULTS ({finished.length})
        </button>
      </div>

      <div className="row g-4">
        {list.map((m) => (
          <div className="col-lg-6" key={m.id}>
            <MatchCard match={m} user={user} members={members} />
          </div>
        ))}
      </div>

      {list.length === 0 && (
        <div className="schedule-empty">
          {tab === "upcoming" ? "예정된 경기가 없습니다." : "진행된 경기가 없습니다."}
        </div>
      )}
    </div>
  );
}

export default Schedule;
*/
