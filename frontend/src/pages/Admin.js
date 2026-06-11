import { useState, useEffect } from "react";
import api from "../api";
import { categoryColors, positionColor } from "../data/constants";
import { extractYouTubeId, youtubeThumb } from "../data/youtube";
import "../styles/admin.css";

function emptyMatch() {
  const t = new Date();
  return {
    date: t.toISOString().slice(0, 10),
    time: "15:00",
    opponent: "",
    opponentDept: "",
    venue: "",
    type: "League",
    sport: "football",
    status: "upcoming",
    homeAway: "home",
    scoreOurs: "",
    scoreTheirs: ""
  };
}

function emptyMember() {
  return {
    number: "",
    name: "",
    nameEn: "",
    position: "MF",
    role: "Member",
    year: "",
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    matches: 0,
    bio: ""
  };
}

function emptyGallery() {
  const t = new Date();
  return {
    title: "",
    tag: "Match",
    mediaType: "image",
    imageUrl: "",
    date: t.toISOString().slice(0, 10)
  };
}

function Admin({ members, matches, notices, gallery, reload }) {
  const [section, setSection] = useState("dashboard");
  const [accounts, setAccounts] = useState([]);
  const [rsvpSummary, setRsvpSummary] = useState({});
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("공지");
  const [newContent, setNewContent] = useState("");
  const [newPinned, setNewPinned] = useState(false);
  const [newImportant, setNewImportant] = useState(false);

  const [newMatch, setNewMatch] = useState(emptyMatch());
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editMatchForm, setEditMatchForm] = useState(null);

  const [newMember, setNewMember] = useState(emptyMember());
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState(null);

  const [newGallery, setNewGallery] = useState(emptyGallery());

  //관리자 데이터 불러오기
  const loadAdminData = async () => {
    try {
      const [a, r, p] = await Promise.all([
        api.get("/api/admin/accounts"),
        api.get("/api/admin/rsvp-summary"),
        api.get("/api/admin/pending-accounts")
      ]);
      setAccounts(a);
      setRsvpSummary(r);
      setPendingAccounts(p);
    } catch (e) {
      console.error(e);
    }
  };

  //가입 승인 처리
  const handleApprove = async (id) => {
    if (!window.confirm("이 가입 신청을 승인하고 선수단에 등록할까요?")) return;
    try {
      await api.post("/api/admin/accounts/" + id + "/approve");
      await loadAdminData();
      await reload();
      flash("승인 완료. 선수단에 등록되었습니다.");
    } catch (e) {
      window.alert("승인 실패: " + e.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("이 가입 신청을 거절하고 삭제할까요?")) return;
    try {
      await api.post("/api/admin/accounts/" + id + "/reject");
      await loadAdminData();
      flash("거절 완료");
    } catch (e) {
      window.alert("거절 실패: " + e.message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  //처리 결과 메시지 표시
  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  // 공지 등록
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      flash("제목과 내용은 필수입니다.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/notices", {
        title: newTitle,
        category: newCategory,
        content: newContent,
        pinned: newPinned,
        important: newImportant
      });
      setNewTitle("");
      setNewContent("");
      setNewPinned(false);
      setNewImportant(false);
      await reload();
      flash("공지가 등록되었습니다.");
    } catch (e) {
      flash("등록 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("이 공지를 삭제할까요?")) return;
    try {
      await api.del("/api/notices/" + id);
      await reload();
      flash("삭제 완료");
    } catch (e) {
      window.alert("삭제 실패: " + e.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm("이 회원을 삭제할까요?")) return;
    try {
      await api.del("/api/admin/accounts/" + id);
      await loadAdminData();
    } catch (e) {
      window.alert("삭제 실패: " + e.message);
    }
  };

  // 경기 추가
  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.opponent || !newMatch.date) {
      flash("상대팀과 날짜는 필수");
      return;
    }
    setBusy(true);
    try {
      const body = { ...newMatch };
      body.scoreOurs = body.scoreOurs === "" ? null : Number(body.scoreOurs);
      body.scoreTheirs = body.scoreTheirs === "" ? null : Number(body.scoreTheirs);
      await api.post("/api/matches", body);
      setNewMatch(emptyMatch());
      await reload();
      flash("경기가 추가되었습니다.");
    } catch (e) {
      flash("추가 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEditMatch = (m) => {
    setEditingMatchId(m.id);
    setEditMatchForm({
      date: m.date,
      time: m.time,
      opponent: m.opponent,
      opponentDept: m.opponentDept || "",
      venue: m.venue || "",
      type: m.type,
      sport: m.sport || "football",
      status: m.status,
      homeAway: m.homeAway,
      scoreOurs: m.scoreOurs ?? "",
      scoreTheirs: m.scoreTheirs ?? ""
    });
  };

  const handleSaveMatch = async (id) => {
    setBusy(true);
    try {
      const body = { ...editMatchForm };
      body.scoreOurs = body.scoreOurs === "" ? null : Number(body.scoreOurs);
      body.scoreTheirs = body.scoreTheirs === "" ? null : Number(body.scoreTheirs);
      await api.put("/api/matches/" + id, body);
      setEditingMatchId(null);
      setEditMatchForm(null);
      await reload();
      flash("경기 정보가 수정되었습니다.");
    } catch (e) {
      flash("수정 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm("이 경기를 삭제할까요?")) return;
    try {
      await api.del("/api/matches/" + id);
      await reload();
      flash("삭제 완료");
    } catch (e) {
      window.alert("삭제 실패: " + e.message);
    }
  };
  
  // 부원 추가
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.number || !newMember.name) {
      flash("번호와 이름은 필수");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/members", {
        ...newMember,
        number: Number(newMember.number),
        year: newMember.year ? Number(newMember.year) : null,
        goals: Number(newMember.goals) || 0,
        assists: Number(newMember.assists) || 0,
        cleanSheets: Number(newMember.cleanSheets) || 0,
        matches: Number(newMember.matches) || 0
      });
      setNewMember(emptyMember());
      await reload();
      flash("부원이 추가되었습니다.");
    } catch (e) {
      flash("추가 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEditMember = (m) => {
    setEditingMemberId(m.id);
    setEditMemberForm({ ...m, year: m.year || "", bio: m.bio || "" });
  };

  const handleSaveMember = async (id) => {
    setBusy(true);
    try {
      const body = {
        ...editMemberForm,
        number: Number(editMemberForm.number),
        year: editMemberForm.year ? Number(editMemberForm.year) : null,
        goals: Number(editMemberForm.goals) || 0,
        assists: Number(editMemberForm.assists) || 0,
        cleanSheets: Number(editMemberForm.cleanSheets) || 0,
        matches: Number(editMemberForm.matches) || 0
      };
      await api.put("/api/members/" + id, body);
      setEditingMemberId(null);
      setEditMemberForm(null);
      await reload();
      flash("수정되었습니다.");
    } catch (e) {
      flash("수정 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("이 부원을 선수단에서 삭제할까요?")) return;
    try {
      await api.del("/api/members/" + id);
      await reload();
      flash("삭제 완료");
    } catch (e) {
      window.alert("삭제 실패: " + e.message);
    }
  };

  // 갤러리 추가
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!newGallery.title || !newGallery.imageUrl) {
      flash("제목과 URL/링크는 필수입니다.");
      return;
    }
    let savedUrl = newGallery.imageUrl.trim();
    if (newGallery.mediaType === "youtube") {
      const vid = extractYouTubeId(savedUrl);
      if (!vid) {
        flash("유튜브 링크를 인식하지 못했습니다. 영상 URL이나 ID를 확인해 주세요.");
        return;
      }
      savedUrl = vid;
    }
    setBusy(true);
    try {
      await api.post("/api/gallery", {
        title: newGallery.title,
        tag: newGallery.tag,
        mediaType: newGallery.mediaType,
        imageUrl: savedUrl,
        date: newGallery.date
      });
      setNewGallery(emptyGallery());
      await reload();
      flash("갤러리에 추가되었습니다.");
    } catch (e) {
      flash("추가 실패: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("이 갤러리 항목을 삭제할까요?")) return;
    try {
      await api.del("/api/gallery/" + id);
      await reload();
      flash("삭제 완료");
    } catch (e) {
      window.alert("삭제 실패: " + e.message);
    }
  };
  const upcomingCount = matches.filter((m) => m.status === "upcoming").length;

  return (
    <div className="container page-section admin-page">
      <div className="section-subtitle">CONTROL CENTER</div>
      <h2 className="section-title">관리자 대시보드</h2>

      {msg && <div className="admin-toast">{msg}</div>}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button
            className={section === "dashboard" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("dashboard")}
          >
            DASHBOARD
          </button>
          <button
            className={section === "notice" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("notice")}
          >
            공지 관리
          </button>
          <button
            className={section === "member" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("member")}
          >
            회원 관리
          </button>
          <button
            className={section === "match" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("match")}
          >
            경기 일정
          </button>
          <button
            className={section === "rsvp" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("rsvp")}
          >
            참석 명단
          </button>
          <button
            className={section === "gallery" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("gallery")}
          >
            갤러리 관리
          </button>
          <button
            className={section === "approval" ? "admin-side-btn active" : "admin-side-btn"}
            onClick={() => setSection("approval")}
          >
            가입 승인 {pendingAccounts.length > 0 && `(${pendingAccounts.length})`}
          </button>
        </aside>

        <main className="admin-content">
          {section === "dashboard" && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="adm-stat-label">선수단 인원</div>
                  <div className="adm-stat-num">{members.length}</div>
                  <div className="adm-stat-sub">선수단 등록 기준</div>
                </div>
                <div className="admin-stat-card">
                  <div className="adm-stat-label">전체 공지</div>
                  <div className="adm-stat-num">{notices.length}</div>
                  <div className="adm-stat-sub">DB 기준</div>
                </div>
                <div className="admin-stat-card">
                  <div className="adm-stat-label">예정 경기</div>
                  <div className="adm-stat-num">{upcomingCount}</div>
                  <div className="adm-stat-sub">매주 정기 경기 진행 중</div>
                </div>
              </div>

              <div className="admin-section-block">
                <h3 className="admin-block-title">최근 공지</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>제목</th>
                      <th>카테고리</th>
                      <th>작성자</th>
                      <th>날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.slice(0, 5).map((n) => (
                      <tr key={n.id}>
                        <td>{n.title}</td>
                        <td>
                          <span className="adm-cat" style={{ color: categoryColors[n.category] }}>
                            {n.category}
                          </span>
                        </td>
                        <td>{n.author}</td>
                        <td>{n.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "notice" && (
            <div>
              <h3 className="admin-block-title">새 공지 작성</h3>
              <form onSubmit={handlePost} className="admin-form">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="label-fc">제목</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="공지 제목"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="label-fc">카테고리</label>
                    <select
                      className="form-control-fc"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="공지">공지</option>
                      <option value="경기">경기</option>
                      <option value="모집">모집</option>
                      <option value="운영">운영</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label-fc">내용</label>
                  <textarea
                    className="form-control-fc"
                    rows="6"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="공지 본문..."
                  ></textarea>
                </div>
                <div className="admin-check-row mt-3">
                  <label>
                    <input
                      type="checkbox"
                      checked={newPinned}
                      onChange={(e) => setNewPinned(e.target.checked)}
                    />
                    상단 고정
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newImportant}
                      onChange={(e) => setNewImportant(e.target.checked)}
                    />
                    중요 표시
                  </label>
                </div>
                <button type="submit" className="btn-primary-green mt-3" disabled={busy}>
                  {busy ? "등록 중..." : "공지 등록"}
                </button>
              </form>

              <div className="admin-section-block mt-5">
                <h3 className="admin-block-title">전체 공지 ({notices.length})</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>제목</th>
                      <th>카테고리</th>
                      <th>작성자</th>
                      <th>날짜</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((n) => (
                      <tr key={n.id}>
                        <td>
                          {n.pinned && <span className="badge-mini">PIN</span>}
                          {n.title}
                        </td>
                        <td>
                          <span className="adm-cat" style={{ color: categoryColors[n.category] }}>
                            {n.category}
                          </span>
                        </td>
                        <td>{n.author}</td>
                        <td>{n.date}</td>
                        <td>
                          <button
                            className="adm-delete-btn"
                            onClick={() => handleDeleteNotice(n.id)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {section === "member" && (
            <div>
              <h3 className="admin-block-title">새 부원 추가</h3>
              <form onSubmit={handleAddMember} className="admin-form">
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="label-fc">번호</label>
                    <input
                      type="number"
                      className="form-control-fc"
                      value={newMember.number}
                      onChange={(e) => setNewMember({ ...newMember, number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="label-fc">이름</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="label-fc">English</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newMember.nameEn}
                      onChange={(e) => setNewMember({ ...newMember, nameEn: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">포지션</label>
                    <select
                      className="form-control-fc"
                      value={newMember.position}
                      onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    >
                      <option>GK</option>
                      <option>DF</option>
                      <option>MF</option>
                      <option>FW</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">학번</label>
                    <input
                      type="number"
                      className="form-control-fc"
                      value={newMember.year}
                      onChange={(e) => setNewMember({ ...newMember, year: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  <div className="col-md-3">
                    <label className="label-fc">역할</label>
                    <select
                      className="form-control-fc"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    >
                      <option>Member</option>
                      <option>Captain</option>
                      <option>Vice-Captain</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">출장</label>
                    <input
                      type="number"
                      className="form-control-fc"
                      value={newMember.matches}
                      onChange={(e) => setNewMember({ ...newMember, matches: e.target.value })}
                    />
                  </div>
                  {newMember.position === "GK" ? (
                    <div className="col-md-2">
                      <label className="label-fc">클린시트</label>
                      <input
                        type="number"
                        className="form-control-fc"
                        value={newMember.cleanSheets}
                        onChange={(e) =>
                          setNewMember({ ...newMember, cleanSheets: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="col-md-2">
                        <label className="label-fc">득점</label>
                        <input
                          type="number"
                          className="form-control-fc"
                          value={newMember.goals}
                          onChange={(e) => setNewMember({ ...newMember, goals: e.target.value })}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="label-fc">도움</label>
                        <input
                          type="number"
                          className="form-control-fc"
                          value={newMember.assists}
                          onChange={(e) => setNewMember({ ...newMember, assists: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2">
                  <label className="label-fc">소개</label>
                  <textarea
                    className="form-control-fc"
                    rows="2"
                    value={newMember.bio}
                    onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary-green mt-3" disabled={busy}>
                  {busy ? "추가 중..." : "부원 추가"}
                </button>
              </form>

              <h3 className="admin-block-title mt-5">선수단 명단 ({members.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>이름</th>
                    <th>POS</th>
                    <th>역할</th>
                    <th>학번</th>
                    <th>스탯</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) =>
                    editingMemberId === m.id ? (
                      <tr key={m.id} className="edit-row">
                        <td colSpan="7">
                          <div className="row g-2">
                            <div className="col-md-1">
                              <input
                                type="number"
                                className="form-control-fc"
                                value={editMemberForm.number}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, number: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control-fc"
                                value={editMemberForm.name}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, name: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control-fc"
                                placeholder="English"
                                value={editMemberForm.nameEn || ""}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, nameEn: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-md-1">
                              <select
                                className="form-control-fc"
                                value={editMemberForm.position}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, position: e.target.value })
                                }
                              >
                                <option>GK</option>
                                <option>DF</option>
                                <option>MF</option>
                                <option>FW</option>
                              </select>
                            </div>
                            <div className="col-md-2">
                              <select
                                className="form-control-fc"
                                value={editMemberForm.role}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, role: e.target.value })
                                }
                              >
                                <option>Member</option>
                                <option>Captain</option>
                                <option>Vice-Captain</option>
                                <option>Manager</option>
                              </select>
                            </div>
                            <div className="col-md-1">
                              <input
                                type="number"
                                className="form-control-fc"
                                placeholder="학번"
                                value={editMemberForm.year}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, year: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-md-1">
                              <input
                                type="number"
                                className="form-control-fc"
                                placeholder="출장"
                                value={editMemberForm.matches}
                                onChange={(e) =>
                                  setEditMemberForm({ ...editMemberForm, matches: e.target.value })
                                }
                              />
                            </div>
                            {editMemberForm.position === "GK" ? (
                              <div className="col-md-2">
                                <input
                                  type="number"
                                  className="form-control-fc"
                                  placeholder="클린시트"
                                  value={editMemberForm.cleanSheets}
                                  onChange={(e) =>
                                    setEditMemberForm({
                                      ...editMemberForm,
                                      cleanSheets: e.target.value
                                    })
                                  }
                                />
                              </div>
                            ) : (
                              <>
                                <div className="col-md-1">
                                  <input
                                    type="number"
                                    className="form-control-fc"
                                    placeholder="G"
                                    value={editMemberForm.goals}
                                    onChange={(e) =>
                                      setEditMemberForm({
                                        ...editMemberForm,
                                        goals: e.target.value
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-md-1">
                                  <input
                                    type="number"
                                    className="form-control-fc"
                                    placeholder="A"
                                    value={editMemberForm.assists}
                                    onChange={(e) =>
                                      setEditMemberForm({
                                        ...editMemberForm,
                                        assists: e.target.value
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div className="mt-2">
                            <textarea
                              className="form-control-fc"
                              rows="2"
                              placeholder="소개"
                              value={editMemberForm.bio || ""}
                              onChange={(e) =>
                                setEditMemberForm({ ...editMemberForm, bio: e.target.value })
                              }
                            ></textarea>
                          </div>
                          <div className="mt-2 text-right">
                            <button
                              className="btn-primary-green"
                              onClick={() => handleSaveMember(m.id)}
                              disabled={busy}
                            >
                              저장
                            </button>{" "}
                            <button
                              className="btn-outline-green"
                              onClick={() => {
                                setEditingMemberId(null);
                                setEditMemberForm(null);
                              }}
                            >
                              취소
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={m.id}>
                        <td>{m.number}</td>
                        <td>
                          {m.name} <span className="text-secondary">({m.nameEn})</span>
                        </td>
                        <td>
                          <span style={{ color: positionColor[m.position] }}>{m.position}</span>
                        </td>
                        <td>{m.role}</td>
                        <td>{m.year}</td>
                        <td>
                          {m.matches}경기{" "}
                          {m.position === "GK"
                            ? `· CS ${m.cleanSheets || 0}`
                            : `· ${m.goals}골 · ${m.assists}A`}
                        </td>
                        <td>
                          <button className="adm-edit-btn" onClick={() => startEditMember(m)}>
                            수정
                          </button>{" "}
                          <button
                            className="adm-delete-btn"
                            onClick={() => handleDeleteMember(m.id)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              <h3 className="admin-block-title mt-5">사이트 가입 회원 ({accounts.length})</h3>
              {accounts.length === 0 ? (
                <div className="admin-empty">아직 가입한 회원이 없습니다.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>아이디</th>
                      <th>이름</th>
                      <th>등번호</th>
                      <th>역할</th>
                      <th>가입일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((a) => (
                      <tr key={a.id}>
                        <td>{a.username}</td>
                        <td>{a.name}</td>
                        <td>{a.number}</td>
                        <td>{a.role}</td>
                        <td>{a.joinedAt ? a.joinedAt.substring(0, 10) : "-"}</td>
                        <td>
                          {a.role !== "admin" && (
                            <button
                              className="adm-delete-btn"
                              onClick={() => handleDeleteAccount(a.id)}
                            >
                              삭제
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {section === "match" && (
            <div>
              <div className="admin-hint-box">
                💡 경기 상태를 <strong>finished</strong> 로 바꾸면, 해당 경기에 게시된 라인업의
                부원들에게 <strong>출장 +1</strong> 이 자동 반영됩니다. (다시 upcoming 으로 되돌리면
                -1)
              </div>
              <h3 className="admin-block-title">새 경기 추가</h3>
              <form onSubmit={handleAddMatch} className="admin-form">
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="label-fc">날짜</label>
                    <input
                      type="date"
                      className="form-control-fc"
                      value={newMatch.date}
                      onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">시간</label>
                    <input
                      type="time"
                      className="form-control-fc"
                      value={newMatch.time}
                      onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">스포츠</label>
                    <select
                      className="form-control-fc"
                      value={newMatch.sport}
                      onChange={(e) => setNewMatch({ ...newMatch, sport: e.target.value })}
                    >
                      <option value="football">⚽ 축구</option>
                      <option value="futsal">🤾 풋살</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">유형</label>
                    <select
                      className="form-control-fc"
                      value={newMatch.type}
                      onChange={(e) => setNewMatch({ ...newMatch, type: e.target.value })}
                    >
                      <option>League</option>
                      <option>Cup</option>
                      <option>Friendly</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">상태</label>
                    <select
                      className="form-control-fc"
                      value={newMatch.status}
                      onChange={(e) => setNewMatch({ ...newMatch, status: e.target.value })}
                    >
                      <option value="upcoming">upcoming</option>
                      <option value="finished">finished</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">홈/원정</label>
                    <select
                      className="form-control-fc"
                      value={newMatch.homeAway}
                      onChange={(e) => setNewMatch({ ...newMatch, homeAway: e.target.value })}
                    >
                      <option value="home">홈</option>
                      <option value="away">원정</option>
                    </select>
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  <div className="col-md-4">
                    <label className="label-fc">상대팀</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newMatch.opponent}
                      onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="label-fc">상대학과</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newMatch.opponentDept}
                      onChange={(e) => setNewMatch({ ...newMatch, opponentDept: e.target.value })}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="label-fc">장소</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                    />
                  </div>
                </div>
                {newMatch.status === "finished" && (
                  <div className="row g-2 mt-1">
                    <div className="col-md-2">
                      <label className="label-fc">우리 득점</label>
                      <input
                        type="number"
                        className="form-control-fc"
                        value={newMatch.scoreOurs}
                        onChange={(e) => setNewMatch({ ...newMatch, scoreOurs: e.target.value })}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="label-fc">상대 득점</label>
                      <input
                        type="number"
                        className="form-control-fc"
                        value={newMatch.scoreTheirs}
                        onChange={(e) => setNewMatch({ ...newMatch, scoreTheirs: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <button type="submit" className="btn-primary-green mt-3" disabled={busy}>
                  {busy ? "추가 중..." : "경기 추가"}
                </button>
              </form>

              <h3 className="admin-block-title mt-5">전체 경기 ({matches.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>스포츠</th>
                    <th>상대</th>
                    <th>장소</th>
                    <th>상태</th>
                    <th>스코어</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {matches
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) =>
                      editingMatchId === m.id ? (
                        <tr key={m.id} className="edit-row">
                          <td colSpan="7">
                            <div className="row g-2">
                              <div className="col-md-2">
                                <input
                                  type="date"
                                  className="form-control-fc"
                                  value={editMatchForm.date}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, date: e.target.value })
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <input
                                  type="time"
                                  className="form-control-fc"
                                  value={editMatchForm.time}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, time: e.target.value })
                                  }
                                />
                              </div>
                              <div className="col-md-2">
                                <select
                                  className="form-control-fc"
                                  value={editMatchForm.sport}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, sport: e.target.value })
                                  }
                                >
                                  <option value="football">축구</option>
                                  <option value="futsal">풋살</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <select
                                  className="form-control-fc"
                                  value={editMatchForm.type}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, type: e.target.value })
                                  }
                                >
                                  <option>League</option>
                                  <option>Cup</option>
                                  <option>Friendly</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <select
                                  className="form-control-fc"
                                  value={editMatchForm.status}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, status: e.target.value })
                                  }
                                >
                                  <option value="upcoming">upcoming</option>
                                  <option value="finished">finished</option>
                                  <option value="cancelled">cancelled</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <select
                                  className="form-control-fc"
                                  value={editMatchForm.homeAway}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, homeAway: e.target.value })
                                  }
                                >
                                  <option value="home">홈</option>
                                  <option value="away">원정</option>
                                </select>
                              </div>
                            </div>
                            <div className="row g-2 mt-1">
                              <div className="col-md-4">
                                <input
                                  type="text"
                                  className="form-control-fc"
                                  placeholder="상대팀"
                                  value={editMatchForm.opponent}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, opponent: e.target.value })
                                  }
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="text"
                                  className="form-control-fc"
                                  placeholder="상대학과"
                                  value={editMatchForm.opponentDept}
                                  onChange={(e) =>
                                    setEditMatchForm({
                                      ...editMatchForm,
                                      opponentDept: e.target.value
                                    })
                                  }
                                />
                              </div>
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  className="form-control-fc"
                                  placeholder="장소"
                                  value={editMatchForm.venue}
                                  onChange={(e) =>
                                    setEditMatchForm({ ...editMatchForm, venue: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            {editMatchForm.status === "finished" && (
                              <div className="row g-2 mt-1">
                                <div className="col-md-2">
                                  <input
                                    type="number"
                                    className="form-control-fc"
                                    placeholder="우리"
                                    value={editMatchForm.scoreOurs}
                                    onChange={(e) =>
                                      setEditMatchForm({
                                        ...editMatchForm,
                                        scoreOurs: e.target.value
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-md-2">
                                  <input
                                    type="number"
                                    className="form-control-fc"
                                    placeholder="상대"
                                    value={editMatchForm.scoreTheirs}
                                    onChange={(e) =>
                                      setEditMatchForm({
                                        ...editMatchForm,
                                        scoreTheirs: e.target.value
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            )}
                            <div className="mt-2 text-right">
                              <button
                                className="btn-primary-green"
                                onClick={() => handleSaveMatch(m.id)}
                                disabled={busy}
                              >
                                저장
                              </button>{" "}
                              <button
                                className="btn-outline-green"
                                onClick={() => {
                                  setEditingMatchId(null);
                                  setEditMatchForm(null);
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={m.id}>
                          <td>
                            {m.date}
                            <br />
                            <span className="text-secondary">{m.time}</span>
                          </td>
                          <td>{m.sport === "futsal" ? "풋살" : "축구"}</td>
                          <td>
                            {m.opponent}
                            <br />
                            <span className="text-secondary">{m.opponentDept}</span>
                          </td>
                          <td>{m.venue}</td>
                          <td>{m.status}</td>
                          <td>
                            {m.status === "finished" ? `${m.scoreOurs} : ${m.scoreTheirs}` : "-"}
                          </td>
                          <td>
                            <button className="adm-edit-btn" onClick={() => startEditMatch(m)}>
                              수정
                            </button>{" "}
                            <button
                              className="adm-delete-btn"
                              onClick={() => handleDeleteMatch(m.id)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          )}

          {section === "rsvp" &&
            (() => {
              const upcomingList = matches
                .filter((m) => m.status === "upcoming")
                .sort((a, b) => a.date.localeCompare(b.date));
              return (
                <div>
                  <h3 className="admin-block-title">예정 경기별 참석 명단</h3>
                  {upcomingList.length === 0 && (
                    <div className="admin-empty">예정된 경기가 없습니다.</div>
                  )}
                  {upcomingList.map((m) => {
                    const data = rsvpSummary[m.id] || { attend: [], late: [] };
                    return (
                      <div key={m.id} className="rsvp-admin-block">
                        <div className="rsvp-admin-head">
                          <div>
                            <div className="rsvp-admin-date">
                              {m.date} · {m.time} · {m.sport === "futsal" ? "풋살" : "축구"}
                            </div>
                            <div className="rsvp-admin-vs">
                              CLASS FC vs {m.opponent}{" "}
                              <span className="text-secondary">({m.venue})</span>
                            </div>
                          </div>
                          <div className="rsvp-admin-totals">
                            <span className="rsvp-count-ok">참석 {data.attend.length}</span>{" "}
                            <span className="rsvp-count-late">늦참 {data.late.length}</span>
                          </div>
                        </div>
                        <div className="rsvp-admin-grid">
                          <div>
                            <div className="rsvp-admin-col-title">참석 ({data.attend.length})</div>
                            {data.attend.length === 0 ? (
                              <div className="rsvp-admin-empty">아직 없음</div>
                            ) : (
                              <ul className="rsvp-name-list">
                                {data.attend.map((r) => (
                                  <li key={r.username}>
                                    #{r.number || "00"} {r.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <div className="rsvp-admin-col-title late-col">
                              늦참 ({data.late.length})
                            </div>
                            {data.late.length === 0 ? (
                              <div className="rsvp-admin-empty">아직 없음</div>
                            ) : (
                              <ul className="rsvp-name-list">
                                {data.late.map((r) => (
                                  <li key={r.username}>
                                    #{r.number || "00"} {r.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          {section === "gallery" && (
            <div>
              <h3 className="admin-block-title">새 갤러리 추가</h3>
              <form onSubmit={handleAddGallery} className="admin-form">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="label-fc">제목</label>
                    <input
                      type="text"
                      className="form-control-fc"
                      value={newGallery.title}
                      onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                      placeholder="예: 2026 봄 정기전"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="label-fc">태그</label>
                    <select
                      className="form-control-fc"
                      value={newGallery.tag}
                      onChange={(e) => setNewGallery({ ...newGallery, tag: e.target.value })}
                    >
                      <option value="Match">Match</option>
                      <option value="Training">Training</option>
                      <option value="Team">Team</option>
                      <option value="Highlight">Highlight</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="label-fc">미디어 종류</label>
                    <select
                      className="form-control-fc"
                      value={newGallery.mediaType}
                      onChange={(e) =>
                        setNewGallery({ ...newGallery, mediaType: e.target.value })
                      }
                    >
                      <option value="image">이미지</option>
                      <option value="youtube">유튜브 영상</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="label-fc">날짜</label>
                    <input
                      type="date"
                      className="form-control-fc"
                      value={newGallery.date}
                      onChange={(e) => setNewGallery({ ...newGallery, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="label-fc">
                    {newGallery.mediaType === "youtube" ? "유튜브 링크 / 영상 ID" : "이미지 URL"}
                  </label>
                  <input
                    type="text"
                    className="form-control-fc"
                    value={newGallery.imageUrl}
                    onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                    placeholder={
                      newGallery.mediaType === "youtube"
                        ? "유튜브 링크 또는 영상 ID 붙여넣기"
                        : "https://... (클라우드 이미지 주소 붙여넣기)"
                    }
                  />
                </div>
                <button type="submit" className="btn-primary-green mt-3" disabled={busy}>
                  {busy ? "추가 중..." : "갤러리 추가"}
                </button>
              </form>

              <div className="admin-section-block mt-5">
                <h3 className="admin-block-title">전체 갤러리 ({gallery.length})</h3>
                {gallery.length === 0 ? (
                  <div className="admin-empty">아직 등록된 갤러리가 없습니다.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>썸네일</th>
                        <th>종류</th>
                        <th>제목</th>
                        <th>태그</th>
                        <th>날짜</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gallery.map((g) => {
                        const isYt = g.mediaType === "youtube";
                        const thumbSrc = isYt ? youtubeThumb(g.imageUrl) : g.imageUrl;
                        return (
                          <tr key={g.id}>
                            <td>
                              {thumbSrc ? (
                                <div className="adm-gal-thumb">
                                  <img src={thumbSrc} alt={g.title} />
                                  {isYt && <span className="adm-gal-play">▶</span>}
                                </div>
                              ) : (
                                <span className="text-secondary">-</span>
                              )}
                            </td>
                            <td>
                              {isYt ? (
                                <span className="badge-mini badge-mini-yt">▶ YT</span>
                              ) : (
                                <span className="badge-mini">IMG</span>
                              )}
                            </td>
                            <td>{g.title}</td>
                            <td>
                              <span className="badge-mini">{g.tag}</span>
                            </td>
                            <td>{g.date}</td>
                            <td>
                              <button
                                className="adm-delete-btn"
                                onClick={() => handleDeleteGallery(g.id)}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {section === "approval" && (
            <div>
              <h3 className="admin-block-title">가입 승인 대기 ({pendingAccounts.length})</h3>
              {pendingAccounts.length === 0 ? (
                <div className="admin-empty">대기 중인 가입 신청이 없습니다.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>아이디</th>
                      <th>이름</th>
                      <th>등번호</th>
                      <th>학번</th>
                      <th>포지션</th>
                      <th>신청일</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAccounts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.username}</td>
                        <td>{p.name}</td>
                        <td>#{p.number}</td>
                        <td>{p.year}학번</td>
                        <td>{p.position}</td>
                        <td>{p.joinedAt ? p.joinedAt.substring(0, 10) : "-"}</td>
                        <td>
                          <button className="btn-primary-green" onClick={() => handleApprove(p.id)}>
                            승인
                          </button>{" "}
                          <button className="adm-delete-btn" onClick={() => handleReject(p.id)}>
                            거절
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
