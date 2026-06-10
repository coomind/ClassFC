import { useState, useEffect } from "react";
import "../styles/countdown.css";

function CountdownBanner({ setPage, matches }) {
  const [closed, setClosed] = useState(
    sessionStorage.getItem("classfc_banner_closed") === "1"
  );

  const [, setTick] = useState(0);

  // 1초마다 남은 시간 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((count) => count + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  if (closed) {
    return null;
  }

  const now = Date.now();

  // 가장 가까운 예정 경기 찾기
  const upcoming = matches
    .filter((match) => match.status === "upcoming")
    .filter((match) => {
      const matchTime = new Date(`${match.date}T${match.time}:00`).getTime();
      return matchTime > now;
    })
    .sort((a, b) => {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });

  const nextMatch = upcoming[0];

  if (!nextMatch) {
    return null;
  }

  const targetTime = new Date(`${nextMatch.date}T${nextMatch.time}:00`).getTime();
  const remainTime = targetTime - now;

  if (remainTime < 0) {
    return null;
  }

  const day = Math.floor(remainTime / (1000 * 60 * 60 * 24));
  const hour = Math.floor((remainTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min = Math.floor((remainTime % (1000 * 60 * 60)) / (1000 * 60));
  const sec = Math.floor((remainTime % (1000 * 60)) / 1000);

  const closeBanner = () => {
    sessionStorage.setItem("classfc_banner_closed", "1");
    setClosed(true);
  };

  const moveSchedule = () => {
    setPage("schedule");
  };

  return (
    <div className="countdown-banner">
      <div className="container countdown-banner-inner">
        <div className="cb-left">
          <span className="cb-pulse"></span>
          <span className="cb-label">NEXT MATCH</span>

          <span className="cb-vs">
            CLASS FC vs <strong>{nextMatch.opponent}</strong>
          </span>

          <span className="cb-meta">
            · {nextMatch.date} {nextMatch.time} · {nextMatch.venue}
          </span>
        </div>

        <div className="cb-right">
          <div className="cb-counter">
            <div className="cb-cell">
              <span>{day}</span>
              <em>D</em>
            </div>

            <div className="cb-cell">
              <span>{String(hour).padStart(2, "0")}</span>
              <em>H</em>
            </div>

            <div className="cb-cell">
              <span>{String(min).padStart(2, "0")}</span>
              <em>M</em>
            </div>

            <div className="cb-cell">
              <span>{String(sec).padStart(2, "0")}</span>
              <em>S</em>
            </div>
          </div>

          <button className="cb-cta" onClick={moveSchedule}>
            일정 보기 →
          </button>

          <button className="cb-close" onClick={closeBanner} aria-label="close">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default CountdownBanner;

/*
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
*/
