import { categoryColors } from "../data/constants";

function NoticeCard({ notice, onClick, compact }) {
  const color = categoryColors[notice.category] || "#00d166";

  return (
    <div
      className={`notice-card card-fc ${compact ? "compact" : ""}`}
      onClick={() => onClick(notice)}
    >
      <div className="notice-card-row">
        <div className="notice-tags">
          {notice.pinned && <span className="notice-pin-tag">PINNED</span>}
          <span className="notice-cat-tag" style={{ background: color + "22", color: color }}>
            {notice.category}
          </span>
          {notice.important && <span className="notice-imp-tag">중요</span>}
        </div>
        <div className="notice-date">{notice.date}</div>
      </div>

      <div className="notice-title">{notice.title}</div>

      {!compact && <div className="notice-preview">{notice.content.substring(0, 95)}...</div>}

      <div className="notice-author">by {notice.author}</div>
    </div>
  );
}

export default NoticeCard;
