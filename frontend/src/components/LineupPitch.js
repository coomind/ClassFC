import { formations } from "../data/formations";
import { positionColor } from "../data/constants";
import "../styles/squad.css";

function LineupPitch({ lineup, members }) {
  if (!lineup) {
    return null;
  }

  const formationList =
    (formations[lineup.type] && formations[lineup.type][lineup.formation]) || [];

  const findMember = (id) => {
    return members.find((member) => String(member.id) === String(id));
  };

  return (
    <div className="lineup-display">
      <div className={`lineup-pitch type-${lineup.type}`}>
        {/* 축구장 라인 */}
        <div className="pitch-line center-line"></div>
        <div className="pitch-circle"></div>
        <div className="pitch-box top-box"></div>
        <div className="pitch-box bottom-box"></div>
        <div className="pitch-small-box top-small"></div>
        <div className="pitch-small-box bottom-small"></div>

        {formationList.map((slot) => {
          const memberId = lineup.assignments[slot.id];
          const member = memberId ? findMember(memberId) : null;
          const color = member ? positionColor[member.position] : null;

          return (
            <div
              key={slot.id}
              className={`lineup-slot ${member ? "filled" : "empty"}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <div
                className="lineup-pos"
                style={color ? { color: color } : null}
              >
                {slot.label}
              </div>

              <div
                className="lineup-shirt"
                style={
                  color
                    ? {
                        background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
                      }
                    : null
                }
              >
                {member ? (
                  <span className="lineup-num">{member.number}</span>
                ) : (
                  <span>—</span>
                )}
              </div>

              <div className="lineup-name">
                {member ? member.name : "미정"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 포메이션 게시 정보 */}
      <div className="lineup-meta">
        <span className="lineup-meta-form">{lineup.formation}</span>

        <span className="lineup-meta-type">
          {lineup.type === "futsal" ? "FUTSAL · 5인" : "FOOTBALL · 11인"}
        </span>

        <span className="lineup-meta-by">
          게시: {lineup.publishedBy} ·{" "}
          {lineup.publishedAt ? lineup.publishedAt.substring(0, 10) : ""}
        </span>
      </div>
    </div>
  );
}

export default LineupPitch;

/*
import { formations } from "../data/formations";
import { positionColor } from "../data/constants";
import "../styles/squad.css";

function LineupPitch({ lineup, members }) {
  if (!lineup) return null;
  const slots = (formations[lineup.type] && formations[lineup.type][lineup.formation]) || [];
  const findMember = (id) => members.find((m) => String(m.id) === String(id));

  return (
    <div className="lineup-display">
      <div className={`lineup-pitch type-${lineup.type}`}>
        <div className="pitch-line center-line"></div>
        <div className="pitch-circle"></div>
        <div className="pitch-box top-box"></div>
        <div className="pitch-box bottom-box"></div>
        <div className="pitch-small-box top-small"></div>
        <div className="pitch-small-box bottom-small"></div>

        {slots.map((slot) => {
          const memberId = lineup.assignments[slot.id];
          const m = memberId ? findMember(memberId) : null;
          const color = m ? positionColor[m.position] : null;
          return (
            <div
              key={slot.id}
              className={`lineup-slot ${m ? "filled" : "empty"}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <div className="lineup-pos" style={color ? { color: color } : null}>
                {slot.label}
              </div>
              <div
                className="lineup-shirt"
                style={
                  color
                    ? { background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)` }
                    : null
                }
              >
                {m ? <span className="lineup-num">{m.number}</span> : <span>—</span>}
              </div>
              <div className="lineup-name">{m ? m.name : "미정"}</div>
            </div>
          );
        })}
      </div>

      <div className="lineup-meta">
        <span className="lineup-meta-form">{lineup.formation}</span>
        <span className="lineup-meta-type">
          {lineup.type === "futsal" ? "FUTSAL · 5인" : "FOOTBALL · 11인"}
        </span>
        <span className="lineup-meta-by">
          게시: {lineup.publishedBy} ·{" "}
          {lineup.publishedAt ? lineup.publishedAt.substring(0, 10) : ""}
        </span>
      </div>
    </div>
  );
}

export default LineupPitch;

*/
