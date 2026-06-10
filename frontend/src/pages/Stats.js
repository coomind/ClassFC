import { useState } from "react";
import { positionColor } from "../data/constants";
import "../styles/stats.css";

function Stats({ members }) {
  const [tab, setTab] = useState("scorers");

  const tabList = [
    { id: "scorers", label: "득점왕" },
    { id: "assists", label: "도움왕" },
    { id: "apps", label: "출장왕" },
    { id: "motm", label: "MOTM" },
    { id: "clean", label: "클린시트" },
  ];

  const labelList = {
    scorers: { title: "득점왕", sub: "TOP SCORERS", col: "GOALS" },
    assists: { title: "도움왕", sub: "TOP ASSISTERS", col: "ASSISTS" },
    apps: { title: "출장왕", sub: "MOST APPEARANCES", col: "MATCHES" },
    motm: { title: "MOTM 랭킹", sub: "MAN OF THE MATCH", col: "MOTM" },
    clean: { title: "클린시트", sub: "CLEAN SHEETS", col: "CS" },
  };

  const current = labelList[tab];

  let sortedMembers = members.map((member) => ({
    ...member,
    motm: member.motm || 0,
    cleanSheets: member.cleanSheets || 0,
  }));

  if (tab === "clean") {
    sortedMembers = sortedMembers.filter((member) => member.position === "GK");
  }

  if (tab === "scorers" || tab === "assists") {
    sortedMembers = sortedMembers.filter((member) => member.position !== "GK");
  }

  // 선택한 탭 기준으로 정렬
  if (tab === "scorers") {
    sortedMembers.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  } else if (tab === "assists") {
    sortedMembers.sort((a, b) => b.assists - a.assists || b.goals - a.goals);
  } else if (tab === "apps") {
    sortedMembers.sort((a, b) => b.matches - a.matches);
  } else if (tab === "motm") {
    sortedMembers.sort((a, b) => b.motm - a.motm);
  } else if (tab === "clean") {
    sortedMembers.sort((a, b) => b.cleanSheets - a.cleanSheets);
  }

  const getCurrentValue = (member) => {
    if (tab === "scorers") {
      return member.goals;
    }

    if (tab === "assists") {
      return member.assists;
    }

    if (tab === "apps") {
      return member.matches;
    }

    if (tab === "motm") {
      return member.motm;
    }

    if (tab === "clean") {
      return member.cleanSheets;
    }

    return 0;
  };

  return (
    <div className="container page-section stats-page">
      <div className="section-subtitle">{current.sub}</div>
      <h2 className="section-title">시즌 {current.title}</h2>

      {/* 기록 탭 */}
      <div className="stats-tabs">
        {tabList.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "stats-tab active" : "stats-tab"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
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
            {sortedMembers.map((member, index) => (
              <tr
                key={member.id}
                className={
                  index === 0
                    ? "rank-1"
                    : index === 1
                    ? "rank-2"
                    : index === 2
                    ? "rank-3"
                    : ""
                }
              >
                <td className="rank-col">
                  <span className="rank-pill">{index + 1}</span>
                </td>

                <td>
                  <div className="stats-player">
                    <span className="stats-player-num">#{member.number}</span>

                    <div>
                      <div className="stats-player-name">{member.name}</div>
                      <div className="stats-player-en">{member.nameEn}</div>
                    </div>

                    {member.role !== "Member" && (
                      <span className="stats-role">{member.role}</span>
                    )}
                  </div>
                </td>

                <td className="num-col">
                  <span
                    className="stats-pos-tag"
                    style={{
                      background: positionColor[member.position] + "22",
                      color: positionColor[member.position],
                    }}
                  >
                    {member.position}
                  </span>
                </td>

                <td className="num-col">{member.matches}</td>

                {tab === "clean" ? (
                  <td className="num-col current-col">
                    <strong>{getCurrentValue(member)}</strong>
                  </td>
                ) : (
                  <>
                    <td className="num-col">{member.goals}</td>
                    <td className="num-col">{member.assists}</td>
                    <td className="num-col">{member.motm}</td>
                    <td className="num-col current-col">
                      <strong>{getCurrentValue(member)}</strong>
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
