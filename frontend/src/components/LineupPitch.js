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
