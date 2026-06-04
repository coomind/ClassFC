import { useState } from "react";
import { positionColor } from "../data/constants";
import "../styles/stats.css";

function Stats({ members }) {
  const [tab, setTab] = useState("scorers");

  let sorted = members.map((m) => ({ ...m, motm: m.motm || 0, cleanSheets: m.cleanSheets || 0 }));
  if (tab === "clean") sorted = sorted.filter((m) => m.position === "GK");
  if (tab === "scorers") sorted = sorted.filter((m) => m.position !== "GK");
  if (tab === "assists") sorted = sorted.filter((m) => m.position !== "GK");

  if (tab === "scorers") sorted.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  else if (tab === "assists") sorted.sort((a, b) => b.assists - a.assists || b.goals - a.goals);
  else if (tab === "apps") sorted.sort((a, b) => b.matches - a.matches);
  else if (tab === "motm") sorted.sort((a, b) => b.motm - a.motm);
  else if (tab === "clean") sorted.sort((a, b) => b.cleanSheets - a.cleanSheets);

  const topVal = (m) => {
    if (tab === "scorers") return m.goals;
    if (tab === "assists") return m.assists;
    if (tab === "apps") return m.matches;
    if (tab === "motm") return m.motm;
    if (tab === "clean") return m.cleanSheets;
    return 0;
  };

  const labelMap = {
    scorers: { title: "득점왕", sub: "TOP SCORERS", col: "GOALS" },
    assists: { title: "도움왕", sub: "TOP ASSISTERS", col: "ASSISTS" },
    apps: { title: "출장왕", sub: "MOST APPEARANCES", col: "MATCHES" },
    motm: { title: "MOTM 랭킹", sub: "MAN OF THE MATCH", col: "MOTM" },
    clean: { title: "클린시트", sub: "CLEAN SHEETS", col: "CS" }
  };

  const current = labelMap[tab];

  return (
    <div className="container page-section stats-page">
      <div className="section-subtitle">{current.sub}</div>
      <h2 className="section-title">시즌 {current.title}</h2>

      <div className="stats-tabs">
        <button
          className={tab === "scorers" ? "stats-tab active" : "stats-tab"}
          onClick={() => setTab("scorers")}
        >
          득점왕
        </button>
        <button
          className={tab === "assists" ? "stats-tab active" : "stats-tab"}
          onClick={() => setTab("assists")}
        >
          도움왕
        </button>
        <button
          className={tab === "apps" ? "stats-tab active" : "stats-tab"}
          onClick={() => setTab("apps")}
        >
          출장왕
        </button>
        <button
          className={tab === "motm" ? "stats-tab active" : "stats-tab"}
          onClick={() => setTab("motm")}
        >
          MOTM
        </button>
        <button
          className={tab === "clean" ? "stats-tab active" : "stats-tab"}
          onClick={() => setTab("clean")}
        >
          클린시트
        </button>
      </div>

      <div className="stats-table-wrap card-fc">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th>선수</th>
              <th className="num-col">POS</th>
              <th className="num-col">M</th>
              {tab === "clean" ? (
                <th className="num-col current-col">{current.col}</th>
              ) : (
                <>
                  <th className="num-col">G</th>
                  <th className="num-col">A</th>
                  <th className="num-col">MOTM</th>
                  <th className="num-col current-col">{current.col}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr
                key={m.id}
                className={i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}
              >
                <td className="rank-col">
                  <span className="rank-pill">{i + 1}</span>
                </td>
                <td>
                  <div className="stats-player">
                    <span className="stats-player-num">#{m.number}</span>
                    <div>
                      <div className="stats-player-name">{m.name}</div>
                      <div className="stats-player-en">{m.nameEn}</div>
                    </div>
                    {m.role !== "Member" && <span className="stats-role">{m.role}</span>}
                  </div>
                </td>
                <td className="num-col">
                  <span
                    className="stats-pos-tag"
                    style={{
                      background: positionColor[m.position] + "22",
                      color: positionColor[m.position]
                    }}
                  >
                    {m.position}
                  </span>
                </td>
                <td className="num-col">{m.matches}</td>
                {tab === "clean" ? (
                  <td className="num-col current-col">
                    <strong>{topVal(m)}</strong>
                  </td>
                ) : (
                  <>
                    <td className="num-col">{m.goals}</td>
                    <td className="num-col">{m.assists}</td>
                    <td className="num-col">{m.motm}</td>
                    <td className="num-col current-col">
                      <strong>{topVal(m)}</strong>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-note">
        ※ MOTM 통계는 부원 투표로 집계됩니다. 경기 종료 후 Schedule 페이지에서 투표할 수 있습니다.
      </div>
    </div>
  );
}

export default Stats;
