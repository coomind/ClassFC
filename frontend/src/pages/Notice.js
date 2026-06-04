import { useState } from "react";
import api from "../api";
import { categoryColors } from "../data/constants";
import NoticeCard from "../components/NoticeCard";
import "../styles/notice.css";

function Notice({ notices, user }) {
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [busy, setBusy] = useState(false);

  const categories = ["전체", "공지", "경기", "모집", "운영"];

  let displayed = notices;
  if (category !== "전체") displayed = displayed.filter((n) => n.category === category);
  if (search) {
    displayed = displayed.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );
  }

  const sorted = [...displayed].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });

  const loadComments = async (id) => {
    try {
      const list = await api.get(`/api/notices/${id}/comments`);
      setComments(list);
    } catch {
      setComments([]);
    }
  };

  const openNotice = (n) => {
    setSelected(n);
    setNewComment("");
    if (n.category !== "공지") loadComments(n.id);
  };

  if (selected) {
    const isOfficial = selected.category === "공지";

    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!user) {
        alert("로그인 후 댓글을 작성할 수 있습니다.");
        return;
      }
      const text = newComment.trim();
      if (!text) return;
      setBusy(true);
      try {
        await api.post(`/api/notices/${selected.id}/comments`, { text });
        setNewComment("");
        await loadComments(selected.id);
      } catch (e) {
        alert("댓글 등록 실패: " + e.message);
      } finally {
        setBusy(false);
      }
    };

    const handleDeleteComment = async (cid) => {
      setBusy(true);
      try {
        await api.del(`/api/notices/${selected.id}/comments/${cid}`);
        await loadComments(selected.id);
      } catch (e) {
        alert("삭제 실패: " + e.message);
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="container page-section notice-detail-page">
        <button onClick={() => setSelected(null)} className="link-arrow notice-back-btn">
          ← 목록으로
        </button>

        <div className="notice-detail-card card-fc">
          <div className="notice-detail-head">
            <div className="notice-tags">
              {selected.pinned && <span className="notice-pin-tag">PINNED</span>}
              <span
                className="notice-cat-tag"
                style={{
                  background: (categoryColors[selected.category] || "#00d166") + "22",
                  color: categoryColors[selected.category] || "#00d166"
                }}
              >
                {selected.category}
              </span>
              {selected.important && <span className="notice-imp-tag">중요</span>}
            </div>

            <h1 className="notice-detail-title">{selected.title}</h1>

            <div className="notice-detail-meta">
              <span>
                by <strong>{selected.author}</strong>
              </span>
              <span className="meta-dot">·</span>
              <span>{selected.date}</span>
              {!isOfficial && comments.length > 0 && (
                <>
                  <span className="meta-dot">·</span>
                  <span>댓글 {comments.length}</span>
                </>
              )}
            </div>
          </div>

          <div className="divider-line"></div>

          <div className="notice-detail-body">{selected.content}</div>
        </div>

        {isOfficial ? (
          <div className="comments-locked">공지사항에는 댓글을 작성할 수 없습니다.</div>
        ) : (
          <div className="comments-section">
            <h3 className="comments-title">댓글 {comments.length}</h3>

            <div className="comments-list">
              {comments.length === 0 && <div className="comments-empty">첫 댓글을 남겨보세요.</div>}
              {comments.map((c) => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-head">
                    <span className="comment-author">
                      #{c.number || "00"} {c.name}
                    </span>
                    <span className="comment-date">
                      {c.date ? c.date.substring(0, 16).replace("T", " ") : ""}
                    </span>
                    {user && (user.id === c.accountId || user.role === "admin") && (
                      <button
                        className="comment-delete"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={busy}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              ))}
            </div>

            {user ? (
              <form className="comment-form" onSubmit={handleAddComment}>
                <div className="comment-form-user">
                  <span className="comment-form-num">#{user.number || "00"}</span>
                  <span className="comment-form-name">{user.name}</span>
                </div>
                <textarea
                  className="form-control-fc comment-textarea"
                  rows="3"
                  placeholder="댓글을 남겨보세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={busy}
                ></textarea>
                <div className="comment-form-actions">
                  <button
                    type="submit"
                    className="btn-primary-green comment-submit"
                    disabled={busy}
                  >
                    {busy ? "등록 중..." : "등록"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="comments-login-hint">댓글 작성은 로그인 후 가능합니다.</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container page-section notice-page">
      <div className="section-subtitle">UPDATES</div>
      <h2 className="section-title">공지 게시판</h2>

      <div className="notice-toolbar">
        <div className="notice-cat-row">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "cat-filter-btn active" : "cat-filter-btn"}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="form-control-fc notice-search"
          placeholder="검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="notice-empty">검색 결과가 없습니다.</div>
      ) : (
        <div className="row g-4">
          {sorted.map((n) => (
            <div className="col-md-6" key={n.id}>
              <NoticeCard notice={n} onClick={openNotice} compact={false} />
            </div>
          ))}
        </div>
      )}

      {user && user.role === "admin" && (
        <div className="notice-admin-hint">관리자 페이지에서 공지를 추가할 수 있습니다.</div>
      )}
    </div>
  );
}

export default Notice;
