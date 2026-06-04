import { useState, useEffect } from "react";
import "../styles/countdown.css";

function CountdownBanner({ setPage, matches }) {
  const [closed, setClosed] = useState(sessionStorage.getItem("classfc_banner_closed") === "1");
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (closed) return null;

  const nowMs = Date.now();
  const upcoming = matches
    .filter((m) => m.status === "upcoming")
    .filter((m) => new Date(`${m.date}T${m.time}:00`).getTime() > nowMs)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0];
  if (!next) return null;

  const target = new Date(`${next.date}T${next.time}:00`).getTime();
  const diff = target - nowMs;
  if (diff < 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const handleClose = () => {
    sessionStorage.setItem("classfc_banner_closed", "1");
    setClosed(true);
  };

  return (
    <div className="countdown-banner">
      <div className="container countdown-banner-inner">
        <div className="cb-left">
          <span className="cb-pulse"></span>
          <span className="cb-label">NEXT MATCH</span>
          <span className="cb-vs">
            CLASS FC vs <strong>{next.opponent}</strong>
          </span>
          <span className="cb-meta">
            · {next.date} {next.time} · {next.venue}
          </span>
        </div>

        <div className="cb-right">
          <div className="cb-counter">
            <div className="cb-cell">
              <span>{days}</span>
              <em>D</em>
            </div>
            <div className="cb-cell">
              <span>{String(hours).padStart(2, "0")}</span>
              <em>H</em>
            </div>
            <div className="cb-cell">
              <span>{String(mins).padStart(2, "0")}</span>
              <em>M</em>
            </div>
            <div className="cb-cell">
              <span>{String(secs).padStart(2, "0")}</span>
              <em>S</em>
            </div>
          </div>
          <button className="cb-cta" onClick={() => setPage("schedule")}>
            일정 보기 →
          </button>
          <button className="cb-close" onClick={handleClose} aria-label="close">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default CountdownBanner;
