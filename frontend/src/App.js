import { useState, useEffect } from "react";
import api from "./api";
import logo from "./assets/classfc-logo.png";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CountdownBanner from "./components/CountdownBanner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Members from "./pages/Members";
import Schedule from "./pages/Schedule";
import Notice from "./pages/Notice";
import Gallery from "./pages/Gallery";
import Stats from "./pages/Stats";
import SquadMaker from "./pages/SquadMaker";
import Admin from "./pages/Admin";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notices, setNotices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 전체 데이터 불러오기
  const loadAll = async () => {
    setLoadError(null);

    try {
      const [memberList, matchList, noticeList, galleryList] = await Promise.all([
        api.get("/api/members"),
        api.get("/api/matches"),
        api.get("/api/notices"),
        api.get("/api/gallery"),
      ]);

      setMembers(memberList);
      setMatches(matchList);
      setNotices(noticeList);
      setGallery(galleryList);
      setLoading(false);
    } catch (error) {
      setLoadError(error.message || "서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // 로그인 토큰 확인
    const token = localStorage.getItem("classfc_token");

    if (token) {
      api
        .get("/api/auth/me")
        .then((me) => {
          if (me) {
            setUser(me);
          }
        })
        .catch(() => {
          localStorage.removeItem("classfc_token");
        });
    }

    loadAll();
  }, []);

  const handleLogin = (loginUser, token) => {
    setUser(loginUser);
    localStorage.setItem("classfc_user", JSON.stringify(loginUser));

    if (token) {
      localStorage.setItem("classfc_token", token);
    }

    setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("classfc_user");
    localStorage.removeItem("classfc_token");
    setPage("home");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-inner">
          <img src={logo} alt="CLASS FC" className="app-loading-logo" />
          <div className="app-loading-title">CLASS FC</div>
          <div className="app-loading-spinner"></div>
          <div className="app-loading-text">서버에 연결 중...</div>
          <div className="app-loading-hint">
            첫 접속은 백엔드가 깨어나는 데 20~40초 걸릴 수 있어요.
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-loading">
        <div className="app-loading-inner">
          <img src={logo} alt="CLASS FC" className="app-loading-logo" />
          <div className="app-loading-title">연결 실패</div>
          <div className="app-loading-err">{loadError}</div>

          <button className="btn-primary-green mt-3" onClick={loadAll}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  let content;

  if (page === "home") {
    content = (
      <Home
        setPage={setPage}
        user={user}
        members={members}
        matches={matches}
        notices={notices}
        gallery={gallery}
      />
    );
  } else if (page === "login") {
    content = <Login onLogin={handleLogin} setPage={setPage} />;
  } else if (page === "members") {
    content = <Members members={members} />;
  } else if (page === "schedule") {
    content = <Schedule matches={matches} user={user} members={members} />;
  } else if (page === "notice") {
    content = <Notice notices={notices} user={user} />;
  } else if (page === "gallery") {
    content = <Gallery gallery={gallery} />;
  } else if (page === "stats") {
    content = <Stats members={members} />;
  } else if (page === "squad") {
    content = <SquadMaker members={members} matches={matches} user={user} />;
  } else if (page === "admin") {
    if (user && user.role === "admin") {
      content = (
        <Admin
          members={members}
          matches={matches}
          notices={notices}
          gallery={gallery}
          reload={loadAll}
        />
      );
    } else {
      content = (
        <div className="container page-section text-center">
          <h2 className="section-title">ACCESS DENIED</h2>
          <p className="text-secondary mt-3">관리자 계정으로 로그인하세요.</p>

          <button
            className="btn-primary-green mt-4"
            onClick={() => setPage("login")}
          >
            LOGIN
          </button>
        </div>
      );
    }
  } else {
    content = (
      <Home
        setPage={setPage}
        user={user}
        members={members}
        matches={matches}
        notices={notices}
        gallery={gallery}
      />
    );
  }

  const bannerClosed = sessionStorage.getItem("classfc_banner_closed") === "1";
  const now = Date.now();

  const hasUpcoming = matches.some((match) => {
    const matchTime = new Date(`${match.date}T${match.time}:00`).getTime();

    return match.status === "upcoming" && matchTime > now;
  });

  const showBanner = !bannerClosed && hasUpcoming;

  return (
    <>
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={handleLogout}
      />

      <CountdownBanner setPage={setPage} matches={matches} />

      <main className={showBanner ? "app-main with-banner" : "app-main"}>
        {content}
      </main>

      <Footer />
    </>
  );
}

export default App;
