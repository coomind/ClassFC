import { useState } from "react";
import api from "../api";
import logo from "../assets/classfc-logo.png";
import "../styles/login.css";

function Login({ onLogin, setPage }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupNumber, setSignupNumber] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    setBusy(true);
    try {
      const r = await api.post("/api/auth/login", { username, password });
      onLogin(r.user, r.token);
    } catch (e) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password || !signupName || !signupNumber || !signupEmail) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setBusy(true);
    try {
      const r = await api.post("/api/auth/signup", {
        username,
        password,
        name: signupName,
        number: signupNumber,
        email: signupEmail
      });
      setSuccess("가입 완료! 자동 로그인합니다...");
      setTimeout(() => onLogin(r.user, r.token), 800);
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("already taken")) setError("이미 사용 중인 아이디 또는 이메일입니다.");
      else if (msg.includes("too short")) setError("비밀번호는 최소 6자 이상이어야 합니다.");
      else setError("가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>

      <div className="container login-container">
        <div className="login-left">
          <div className="login-brand">
            <img src={logo} alt="CLASS FC" className="login-brand-logo" />
            <div className="login-brand-text">
              <div className="login-brand-title">CLASS FC</div>
              <div className="login-brand-sub">OFFICIAL CLUB ACCESS</div>
            </div>
          </div>

          <h1 className="login-quote-title">
            "WE PLAY <span className="green-accent">AS ONE</span>."
          </h1>
          <p className="login-quote-sub">
            동아리 부원 전용 공간으로 들어오세요. 경기 일정, 라인업, 공지를 한 곳에서 확인할 수
            있습니다.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span className="lf-icon">●</span>
              실시간 공지 및 알림
            </div>
            <div className="login-feature">
              <span className="lf-icon">●</span>
              경기 일정 및 라인업 확인
            </div>
            <div className="login-feature">
              <span className="lf-icon">●</span>팀 갤러리 열람
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card card-fc">
            <div className="login-tabs">
              <button
                className={mode === "login" ? "login-tab active" : "login-tab"}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                LOGIN
              </button>
              <button
                className={mode === "signup" ? "login-tab active" : "login-tab"}
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccess("");
                }}
              >
                SIGN UP
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="login-form">
                <h2 className="login-form-title">로그인</h2>

                <div className="mb-3">
                  <label className="label-fc">아이디</label>
                  <input
                    type="text"
                    className="form-control-fc"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                  />
                </div>

                <div className="mb-3">
                  <label className="label-fc">비밀번호</label>
                  <input
                    type="password"
                    className="form-control-fc"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                  />
                </div>

                {error && <div className="login-error">{error}</div>}

                <button type="submit" className="btn-primary-green login-submit" disabled={busy}>
                  {busy ? "로그인 중..." : "LOGIN →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="login-form">
                <h2 className="login-form-title">신규 부원 가입</h2>

                <div className="mb-3">
                  <label className="label-fc">아이디</label>
                  <input
                    type="text"
                    className="form-control-fc"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="영문/숫자"
                  />
                </div>

                <div className="mb-3">
                  <label className="label-fc">비밀번호 (6자 이상)</label>
                  <input
                    type="password"
                    className="form-control-fc"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                  />
                </div>

                <div className="row">
                  <div className="col-7 mb-3">
                    <label className="label-fc">이름</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="col-5 mb-3">
                    <label className="label-fc">등번호</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={signupNumber}
                      onChange={(e) => setSignupNumber(e.target.value)}
                      placeholder="00"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="label-fc">이메일</label>
                  <input
                    type="email"
                    className="form-control-fc"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@university.ac.kr"
                  />
                </div>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                <button type="submit" className="btn-primary-green login-submit" disabled={busy}>
                  {busy ? "가입 중..." : "CREATE ACCOUNT →"}
                </button>
              </form>
            )}

            <div className="login-back">
              <button onClick={() => setPage("home")} className="link-arrow">
                ← 메인으로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
