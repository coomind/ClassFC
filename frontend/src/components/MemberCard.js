import { positionColor } from "../data/constants";
import JerseyIcon from "./JerseyIcon";

function MemberCard({ member, onClick }) {
  const motmCount = member.motm || 0;

  return (
    <div className="member-card card-fc" onClick={() => onClick(member)}>
      <div className="member-card-top">
        <div
          className="member-pos-badge"
          style={{
            background: positionColor[member.position] + "22",
            color: positionColor[member.position]
          }}
        >
          {member.position}
        </div>
      </div>

      {motmCount > 0 && <div className="member-motm-badge">★ MOTM × {motmCount}</div>}

      <div className="member-avatar">
        <JerseyIcon number={member.number} color="#ffffff" size={140} />
      </div>

      <div className="member-card-body">
        <div className="member-name">{member.name}</div>
        <div className="member-name-en">{member.nameEn}</div>
        {member.role !== "Member" && <div className="member-role-tag">{member.role}</div>}
      </div>

      <div className="member-card-stats">
        <div className="stat-block">
          <div className="stat-num">{member.matches}</div>
          <div className="stat-label">MATCHES</div>
        </div>
        {member.position === "GK" ? (
          <div className="stat-block">
            <div className="stat-num">{member.cleanSheets || 0}</div>
            <div className="stat-label">CLEAN SHEETS</div>
          </div>
        ) : (
          <>
            <div className="stat-block">
              <div className="stat-num">{member.goals}</div>
              <div className="stat-label">GOALS</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">{member.assists}</div>
              <div className="stat-label">ASSISTS</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
