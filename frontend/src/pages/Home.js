import { useState, useEffect } from "react";
import { youtubeThumb } from "../data/youtube";
import MatchCard from "../components/MatchCard";
import NoticeCard from "../components/NoticeCard";
import logo from "../assets/classfc-logo.png";
import "../styles/home.css";

function Home({ setPage, user, members, matches, notices, gallery }) {
  const [, setTick] = useState(0);
  const [galleryOffset, setGalleryOffset] = useState(0);

  // 1초마다 카운트다운 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((count) => count + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 갤러리 미리보기 자동 변경
  useEffect(() => {
    if (gallery.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setGalleryOffset((offset) => (offset + 1) % gallery.length);
    }, 6000);

    return () => {
      clearInterval(timer);
    };
  }, [gallery.length]);

  const now = Date.now();

  const upcomingMatches = matches
    .filter((match) => match.status === "upcoming")
    .filter((match) => {
      const matchTime = new Date(`${match.date}T${match.time}:00`).getTime();
      return matchTime > now;
    })
    .sort((a, b) => {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });

  const nextMatch = upcomingMatches[0];

  const recentNotices = [...notices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const previewGallery = gallery.length
    ? Array.from(
        { length: Math.min(5, gallery.length) },
        (_, index) => gallery[(galleryOffset + index) % gallery.length]
      )
    : [];

  const totalGoals = members.reduce((sum, member) => {
    return sum + (member.goals || 0);
  }, 0);

  const totalMatches = matches.filter((match) => {
    return match.status === "finished";
  }).length;

  const wins = matches.filter((match) => {
    return (
      match.status === "finished" &&
      match.scoreOurs > match.scoreTheirs
    );
  }).length;

  let countdown = "경기 정보 없음";

  // 다음 경기까지 남은 시간 계산
  if (nextMatch) {
    const targetTime = new Date(`${nextMatch.date}T${nextMatch.time}:00`).getTime();
    const remainTime = targetTime - Date.now();

    if (remainTime > 0) {
      const day = Math.floor(remainTime / (1000 * 60 * 60 * 24));
      const hour = Math.floor((remainTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const min = Math.floor((remainTime % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((remainTime % (1000 * 60)) / 1000);

      countdown = `${day}일 ${hour}시간 ${min}분 ${sec}초`;
    } else {
      countdown = "경기 진행 중";
    }
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <img src={logo} alt="" className="hero-watermark" />

        <div className="container hero-inner">
          <div className="hero-crest-row">
            <img src={logo} alt="CLASS FC" className="hero-crest" />
          </div>

          <div className="hero-meta">
            <span className="hero-est">EST. 2013</span>
            <span className="hero-dot">·</span>
            <span className="hero-dept">DEPT. OF SOFTWARE</span>
          </div>

          <h1 className="hero-title">
            CLASS <span className="green-accent">FC</span>
          </h1>

          <div className="hero-slogan">
            "Building the digital home of our football family."
          </div>

          <div className="hero-sub">
            소프트웨어학과 축구 동아리 공식 웹사이트
          </div>

          <div className="hero-buttons">
            <button
              className="btn-primary-green"
              onClick={() => setPage("schedule")}
            >
              NEXT MATCH →
            </button>

            <button
              className="btn-outline-green"
              onClick={() => setPage("members")}
            >
              MEET THE TEAM
            </button>
          </div>

          {/* 메인 통계 */}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{members.length}</div>
              <div className="hero-stat-label">PLAYERS</div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-num">{totalMatches}</div>
              <div className="hero-stat-label">MATCHES</div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-num">{wins}</div>
              <div className="hero-stat-label">WINS</div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-num">{totalGoals}</div>
              <div className="hero-stat-label">GOALS</div>
            </div>
          </div>
        </div>
      </section>

      {/* 다음 경기 */}
      {nextMatch && (
        <section className="next-match-section">
          <div className="container">
            <div className="next-match-row">
              <div className="next-match-label">
                <div className="badge-green">NEXT MATCH</div>
                <h3 className="next-match-title">다가오는 경기까지</h3>
                <div className="countdown-text">{countdown}</div>

                <button
                  className="btn-outline-green mt-3"
                  onClick={() => setPage("schedule")}
                >
                  전체 일정 보기
                </button>
              </div>

              <div className="next-match-card-wrap">
                <MatchCard match={nextMatch} user={user} members={members} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 최근 공지 */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-subtitle">LATEST</div>
              <h2 className="section-title">최근 공지</h2>
            </div>

            <button className="link-arrow" onClick={() => setPage("notice")}>
              ALL NOTICES →
            </button>
          </div>

          <div className="row g-4">
            {recentNotices.map((notice) => (
              <div className="col-md-4" key={notice.id}>
                <NoticeCard
                  notice={notice}
                  compact={false}
                  onClick={() => setPage("notice")}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 갤러리 미리보기 */}
      <section className="home-section gallery-preview-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-subtitle">MEMORIES</div>
              <h2 className="section-title">갤러리 미리보기</h2>
            </div>

            <button className="link-arrow" onClick={() => setPage("gallery")}>
              VIEW ALL →
            </button>
          </div>

          <div className="gallery-preview-grid">
            {previewGallery.map((item, index) => {
              const isYoutube = item.mediaType === "youtube";
              const cover = isYoutube ? youtubeThumb(item.imageUrl) : item.imageUrl;

              const tileStyle = cover
                ? {
                    backgroundImage: "url(" + cover + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: item.gradient };

              return (
                <div
                  key={item.id}
                  className={`gallery-preview-tile tile-${index}`}
                  style={tileStyle}
                  onClick={() => setPage("gallery")}
                >
                  {isYoutube && <div className="gallery-tile-play">▶</div>}

                  <div className="gallery-tile-overlay">
                    <div className="gallery-tile-tag">{item.tag}</div>
                    <div className="gallery-tile-title">{item.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {gallery.length > 0 && (
            <div className="gallery-slide-dots">
              {previewGallery.map((item, index) => (
                <span
                  key={index}
                  className={index === 0 ? "slide-dot active" : "slide-dot"}
                ></span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-box">
            <div>
              <div className="badge-green">JOIN US</div>
              <h2 className="cta-title">함께 뛸 사람을 찾습니다.</h2>
              <p className="cta-desc">
                실력보다 중요한 건 동료와 함께한다는 것. 신입 부원은 언제든 환영입니다.
              </p>
            </div>

            <div className="home-cta-action">
              {user ? (
                <button
                  className="btn-primary-green"
                  onClick={() => setPage("notice")}
                >
                  공지 확인하기
                </button>
              ) : (
                <button
                  className="btn-primary-green"
                  onClick={() => setPage("login")}
                >
                  SIGN UP NOW
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 프로젝트 소개 */}
      <section className="project-info-section">
        <div className="container">
          <div className="project-info-grid">
            <div className="pi-col">
              <div className="pi-head">PROJECT</div>
              <p className="pi-text">
                CLASS FC 공식 웹사이트는 소프트웨어학과 축구 동아리의 활동을 한 곳에서 지원하는 단일
                웹 플랫폼입니다. React 프론트엔드와 Node.js · MySQL 백엔드로 만들었습니다.
              </p>
            </div>

            <div className="pi-col">
              <div className="pi-head">FEATURES</div>
              <ul className="pi-list">
                <li>선수단 · 포지션별 프로필</li>
                <li>경기 일정 · 참석 체크</li>
                <li>스쿼드 메이커 · 라인업</li>
                <li>통계 · MOTM 투표</li>
                <li>공지 · 댓글</li>
                <li>갤러리</li>
              </ul>
            </div>

            <div className="pi-col">
              <div className="pi-head">TEAM CLASS</div>
              <ul className="pi-list">
                <li>차형창 · Hyeong-chang Cha</li>
                <li>이성준 · Seong-jun Lee</li>
                <li>김태효 · Tae-hyo Kim</li>
              </ul>
              <div className="pi-stack">React · Node.js · Express · MySQL</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

/*
import { useState, useEffect } from "react";
import { youtubeThumb } from "../data/youtube";
import MatchCard from "../components/MatchCard";
import NoticeCard from "../components/NoticeCard";
import logo from "../assets/classfc-logo.png";
import "../styles/home.css";

function Home({ setPage, user, members, matches, notices, gallery }) {
  const [, setTick] = useState(0);
  const [galleryOffset, setGalleryOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (gallery.length === 0) return;
    const id = setInterval(() => {
      setGalleryOffset((o) => (o + 1) % gallery.length);
    }, 6000);
    return () => clearInterval(id);
  }, [gallery.length]);

  const nowMs = Date.now();
  const upcoming = matches
    .filter((m) => m.status === "upcoming")
    .filter((m) => new Date(`${m.date}T${m.time}:00`).getTime() > nowMs)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextMatch = upcoming[0];

  const recentNotices = [...notices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const previewGallery = gallery.length
    ? Array.from(
        { length: Math.min(5, gallery.length) },
        (_, i) => gallery[(galleryOffset + i) % gallery.length]
      )
    : [];

  const totalGoals = members.reduce((s, m) => s + (m.goals || 0), 0);
  const totalMatches = matches.filter((m) => m.status === "finished").length;
  const wins = matches.filter((m) => m.status === "finished" && m.scoreOurs > m.scoreTheirs).length;

  let countdown = "경기 정보 없음";
  if (nextMatch) {
    const target = new Date(`${nextMatch.date}T${nextMatch.time}:00`).getTime();
    const diff = target - Date.now();
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      countdown = `${days}일 ${hours}시간 ${mins}분 ${secs}초`;
    } else {
      countdown = "경기 진행 중";
    }
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <img src={logo} alt="" className="hero-watermark" />
        <div className="container hero-inner">
          <div className="hero-crest-row">
            <img src={logo} alt="CLASS FC" className="hero-crest" />
          </div>
          <div className="hero-meta">
            <span className="hero-est">EST. 2013</span>
            <span className="hero-dot">·</span>
            <span className="hero-dept">DEPT. OF SOFTWARE</span>
          </div>
          <h1 className="hero-title">
            CLASS <span className="green-accent">FC</span>
          </h1>
          <div className="hero-slogan">"Building the digital home of our football family."</div>
          <div className="hero-sub">소프트웨어학과 축구 동아리 공식 웹사이트</div>

          <div className="hero-buttons">
            <button className="btn-primary-green" onClick={() => setPage("schedule")}>
              NEXT MATCH →
            </button>
            <button className="btn-outline-green" onClick={() => setPage("members")}>
              MEET THE TEAM
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{members.length}</div>
              <div className="hero-stat-label">PLAYERS</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{totalMatches}</div>
              <div className="hero-stat-label">MATCHES</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{wins}</div>
              <div className="hero-stat-label">WINS</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{totalGoals}</div>
              <div className="hero-stat-label">GOALS</div>
            </div>
          </div>
        </div>
      </section>

      {nextMatch && (
        <section className="next-match-section">
          <div className="container">
            <div className="next-match-row">
              <div className="next-match-label">
                <div className="badge-green">NEXT MATCH</div>
                <h3 className="next-match-title">다가오는 경기까지</h3>
                <div className="countdown-text">{countdown}</div>
                <button className="btn-outline-green mt-3" onClick={() => setPage("schedule")}>
                  전체 일정 보기
                </button>
              </div>
              <div className="next-match-card-wrap">
                <MatchCard match={nextMatch} user={user} members={members} />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-subtitle">LATEST</div>
              <h2 className="section-title">최근 공지</h2>
            </div>
            <button className="link-arrow" onClick={() => setPage("notice")}>
              ALL NOTICES →
            </button>
          </div>

          <div className="row g-4">
            {recentNotices.map((n) => (
              <div className="col-md-4" key={n.id}>
                <NoticeCard notice={n} compact={false} onClick={() => setPage("notice")} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section gallery-preview-section">
        <div className="container">
          <div className="home-section-head">
            <div>
              <div className="section-subtitle">MEMORIES</div>
              <h2 className="section-title">갤러리 미리보기</h2>
            </div>
            <button className="link-arrow" onClick={() => setPage("gallery")}>
              VIEW ALL →
            </button>
          </div>

          <div
            className="gallery-preview-grid"
          >
            {previewGallery.map((g, i) => {
                const isYt = g.mediaType === "youtube";
                const cover = isYt ? youtubeThumb(g.imageUrl) : g.imageUrl;
                const tileStyle = cover
                  ? {
                      backgroundImage: "url(" + cover + ")",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : { background: g.gradient };
                return (
                  <div
                    key={g.id}
                    className={`gallery-preview-tile tile-${i}`}
                    style={tileStyle}
                    onClick={() => setPage("gallery")}
                  >
                    {isYt && <div className="gallery-tile-play">▶</div>}
                    <div className="gallery-tile-overlay">
                      <div className="gallery-tile-tag">{g.tag}</div>
                      <div className="gallery-tile-title">{g.title}</div>
                    </div>
                  </div>
                );
              })}
          </div>
            {gallery.length > 0 && (
            <div className="gallery-slide-dots">
              {previewGallery.map((g, i) => (
                <span
                  key={i}
                  className={i === 0 ? "slide-dot active" : "slide-dot"}
                ></span>
              ))}
            </div>
            )}
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-box">
            <div>
              <div className="badge-green">JOIN US</div>
              <h2 className="cta-title">함께 뛸 사람을 찾습니다.</h2>
              <p className="cta-desc">
                실력보다 중요한 건 동료와 함께한다는 것. 신입 부원은 언제든 환영입니다.
              </p>
            </div>
            <div className="home-cta-action">
              {user ? (
                <button className="btn-primary-green" onClick={() => setPage("notice")}>
                  공지 확인하기
                </button>
              ) : (
                <button className="btn-primary-green" onClick={() => setPage("login")}>
                  SIGN UP NOW
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="project-info-section">
        <div className="container">
          <div className="project-info-grid">
            <div className="pi-col">
              <div className="pi-head">PROJECT</div>
              <p className="pi-text">
                CLASS FC 공식 웹사이트는 소프트웨어학과 축구 동아리의 활동을 한 곳에서 지원하는 단일
                웹 플랫폼입니다. React 프론트엔드와 Node.js · MySQL 백엔드로 만들었습니다.
              </p>
            </div>
            <div className="pi-col">
              <div className="pi-head">FEATURES</div>
              <ul className="pi-list">
                <li>선수단 · 포지션별 프로필</li>
                <li>경기 일정 · 참석 체크</li>
                <li>스쿼드 메이커 · 라인업</li>
                <li>통계 · MOTM 투표</li>
                <li>공지 · 댓글</li>
                <li>갤러리</li>
              </ul>
            </div>
            <div className="pi-col">
              <div className="pi-head">TEAM CLASS</div>
              <ul className="pi-list">
                <li>차형창 · Hyeong-chang Cha</li>
                <li>이성준 · Seong-jun Lee</li>
                <li>김태효 · Tae-hyo Kim</li>
              </ul>
              <div className="pi-stack">React · Node.js · Express · MySQL</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
*/

