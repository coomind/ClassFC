import { useState } from "react";
import logo from "../assets/classfc-logo.png";
import "../styles/navbar.css";

function Navbar({ page, setPage, user, onLogout }) {
  const [open, setOpen] = useState(false);

  const menuList = [
    { id: "home", label: "HOME" },
    { id: "members", label: "MEMBERS" },
    { id: "schedule", label: "SCHEDULE" },
    { id: "stats", label: "STATS" },
    { id: "squad", label: "SQUAD" },
    { id: "notice", label: "NOTICE" },
    { id: "gallery", label: "GALLERY" },
  ];

  // 메뉴 이동
  const movePage = (pageName) => {
    setPage(pageName);
    setOpen(false);
  };

  return (
    <header className="fc-navbar">
      <div className="container fc-navbar-inner">
        <div className="fc-brand" onClick={() => movePage("home")}>
          <img src={logo} alt="CLASS FC" className="fc-brand-logo" />

          <div className="fc-brand-text">
            <div className="fc-brand-title">CLASS FC</div>
            <div className="fc-brand-sub">EST. 2013 · DEPT. OF SOFTWARE</div>
          </div>
        </div>

        <button
          className="fc-burger"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={open ? "fc-nav open" : "fc-nav"}>
          {menuList.map((menu) => (
            <button
              key={menu.id}
              className={page === menu.id ? "fc-nav-link active" : "fc-nav-link"}
              onClick={() => movePage(menu.id)}
            >
              {menu.label}
            </button>
          ))}

          {/* 관리자 메뉴 */}
          {user && user.role === "admin" && (
            <button
              className={page === "admin" ? "fc-nav-link active" : "fc-nav-link"}
              onClick={() => movePage("admin")}
            >
              ADMIN
            </button>
          )}

          <div className="fc-nav-divider"></div>

          {user ? (
            <div className="fc-user-area">
              <span className="fc-user-name">
                #{user.number || "00"} {user.name}
              </span>

              <button className="fc-logout-btn" onClick={onLogout}>
                LOGOUT
              </button>
            </div>
          ) : (
            <button className="fc-login-btn" onClick={() => movePage("login")}>
              LOGIN / SIGN UP
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

/*
import { useState } from "react";
import logo from "../assets/classfc-logo.png";
import "../styles/navbar.css";

function Navbar({ page, setPage, user, onLogout }) {
  const [open, setOpen] = useState(false);

  const goTo = (p) => {
    setPage(p);
    setOpen(false);
  };

  const navItems = [
    { id: "home", label: "HOME" },
    { id: "members", label: "MEMBERS" },
    { id: "schedule", label: "SCHEDULE" },
    { id: "stats", label: "STATS" },
    { id: "squad", label: "SQUAD" },
    { id: "notice", label: "NOTICE" },
    { id: "gallery", label: "GALLERY" }
  ];

  return (
    <header className="fc-navbar">
      <div className="container fc-navbar-inner">
        <div className="fc-brand" onClick={() => goTo("home")}>
          <img src={logo} alt="CLASS FC" className="fc-brand-logo" />
          <div className="fc-brand-text">
            <div className="fc-brand-title">CLASS FC</div>
            <div className="fc-brand-sub">EST. 2013 · DEPT. OF SOFTWARE</div>
          </div>
        </div>

        <button className="fc-burger" onClick={() => setOpen(!open)} aria-label="menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={open ? "fc-nav open" : "fc-nav"}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "fc-nav-link active" : "fc-nav-link"}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          {user && user.role === "admin" && (
            <button
              className={page === "admin" ? "fc-nav-link active" : "fc-nav-link"}
              onClick={() => goTo("admin")}
            >
              ADMIN
            </button>
          )}

          <div className="fc-nav-divider"></div>

          {user ? (
            <div className="fc-user-area">
              <span className="fc-user-name">
                #{user.number || "00"} {user.name}
              </span>
              <button className="fc-logout-btn" onClick={onLogout}>
                LOGOUT
              </button>
            </div>
          ) : (
            <button className="fc-login-btn" onClick={() => goTo("login")}>
              LOGIN / SIGN UP
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
*/
