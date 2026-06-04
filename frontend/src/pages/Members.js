import { useState } from "react";
import { positionColor } from "../data/constants";
import MemberCard from "../components/MemberCard";
import JerseyIcon from "../components/JerseyIcon";
import "../styles/members.css";

function Members({ members }) {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const positions = ["ALL", "GK", "DF", "MF", "FW"];
  const filtered = filter === "ALL" ? members : members.filter((m) => m.position === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (a.role === "Captain") return -1;
    if (b.role === "Captain") return 1;
    if (a.role === "Vice-Captain") return -1;
    if (b.role === "Vice-Captain") return 1;
    return a.number - b.number;
  });

  return (
    <div className="container page-section members-page">
      <div className="section-subtitle">SQUAD</div>
      <h2 className="section-title">CLASS FC 선수단</h2>

      <div className="members-filter">
        {positions.map((p) => (
          <button
            key={p}
            className={filter === p ? "pos-filter-btn active" : "pos-filter-btn"}
            onClick={() => setFilter(p)}
          >
            {p === "ALL" ? "전체" : p}
            <span className="pos-filter-count">
              {p === "ALL" ? members.length : members.filter((m) => m.position === p).length}
            </span>
          </button>
        ))}
      </div>

      <div className="row g-4 mt-2">
        {sorted.map((m) => (
          <div className="col-lg-3 col-md-4 col-sm-6" key={m.id}>
            <MemberCard member={m} onClick={setSelected} />
          </div>
        ))}
      </div>

      {selected && (
        <div className="member-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="member-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="member-modal-close" onClick={() => setSelected(null)}>
              ×
            </button>

            <div className="member-modal-head">
              <div className="member-modal-jersey">
                <JerseyIcon number={selected.number} color="#ffffff" size={150} />
              </div>
              <div className="member-modal-num">#{selected.number}</div>
            </div>

            <div className="member-modal-name">{selected.name}</div>
            <div className="member-modal-name-en">{selected.nameEn}</div>

            <div className="member-modal-tags">
              <span
                className="modal-pos-badge"
                style={{
                  background: positionColor[selected.position] + "22",
                  color: positionColor[selected.position]
                }}
              >
                {selected.position}
              </span>
              <span className="modal-year-badge">{selected.year}학번</span>
              {selected.role !== "Member" && (
                <span className="modal-role-badge">{selected.role}</span>
              )}
            </div>

            <div className="divider-line"></div>

            <div className="member-modal-bio">{selected.bio}</div>

            <div className="member-modal-stats">
              <div className="modal-stat">
                <div className="modal-stat-num">{selected.matches}</div>
                <div className="modal-stat-label">MATCHES</div>
              </div>
              {selected.position === "GK" ? (
                <div className="modal-stat">
                  <div className="modal-stat-num">{selected.cleanSheets || 0}</div>
                  <div className="modal-stat-label">CLEAN SHEETS</div>
                </div>
              ) : (
                <>
                  <div className="modal-stat">
                    <div className="modal-stat-num">{selected.goals}</div>
                    <div className="modal-stat-label">GOALS</div>
                  </div>
                  <div className="modal-stat">
                    <div className="modal-stat-num">{selected.assists}</div>
                    <div className="modal-stat-label">ASSISTS</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
