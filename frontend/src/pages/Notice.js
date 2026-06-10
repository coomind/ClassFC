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

  const categoryList = ["전체", "공지", "경기", "모집", "운영"];

  let displayedNotices = notices;

  if (category !== "전체") {
    displayedNotices = displayedNotices.filter((notice) => {
      return notice.category === category;
    });
  }

  if (search) {
    displayedNotices = displayedNotices.filter((notice) => {
      return (
        notice.title.toLowerCase().includes(search.toLowerCase()) ||
        notice.content.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  const sortedNotices = [...displayedNotices].sort((a, b) => {
    if (a.pinned && !b.pinned) {
      return -1;
    }

    if (!a.pinned && b.pinned) {
      return 1;
    }

    return b.date.localeCompare(a.date);
  });

  // 댓글 불러오기
  const loadComments = async (id) => {
    try {
      const list = await api.get(`/api/notices/${id}/comments`);
      setComments(list);
    } catch (error) {
      setComments([]);
    }
  };

  const openNotice = (notice) => {
    setSelected(notice);
    setNewComment("");

    if (notice.category !== "공지") {
      loadComments(notice.id);
    }
  };

  const closeNotice = () => {
    setSelected(null);
  };

  if (selected) {
    const isOfficial = selected.category === "공지";
    const selectedColor = categoryColors[selected.category] || "#00d166";

    // 댓글 등록
    const handleAddComment = async (event) => {
      event.preventDefault();

      if (!user) {
        alert("로그인 후 댓글을 작성할 수 있습니다.");
        return;
      }

      const text = newComment.trim();

      if (!text) {
        return;
      }

      setBusy(true);

      try {
        await api.post(`/api/notices/${selected.id}/comments`, { text });
        setNewComment("");
        await loadComments(selected.id);
      } catch (error) {
        alert("댓글 등록 실패: " + error.message);
      } finally {
        setBusy(false);
      }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
      setBusy(true);

      try {
        await api.del(`/api/notices/${selected.id}/comments/${commentId}`);
        await loadComments(selected.id);
      } catch (error) {
        alert("삭제 실패: " + error.message);
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="container page-section notice-detail-page">
        <button onClick={closeNotice} className="link-arrow notice-back-btn">
          ← 목록으로
        </button>

        <div className="notice-detail-card card-fc">
          <div className="notice-detail-head">
            <div className="notice-tags">
              {selected.pinned && (
                <span className="notice-pin-tag">PINNED</span>
              )}

              <span
                className="notice-cat-tag"
                style={{
                  background: selectedColor + "22",
                  color: selectedColor,
                }}
              >
                {selected.category}
              </span>

              {selected.important && (
                <span className="notice-imp-tag">중요</span>
              )}
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
          <div className="comments-locked">
            공지사항에는 댓글을 작성할 수 없습니다.
          </div>
        ) : (
          <div className="comments-section">
            <h3 className="comments-title">댓글 {comments.length}</h3>

            {/* 댓글 목록 */}
            <div className="comments-list">
              {comments.length === 0 && (
                <div className="comments-empty">첫 댓글을 남겨보세요.</div>
              )}

              {comments.map((comment) => (
                <div className="comment-item" key={comment.id}>
                  <div className="comment-head">
                    <span className="comment-author">
                      #{comment.number || "00"} {comment.name}
                    </span>

                    <span className="comment-date">
                      {comment.date
                        ? comment.date.substring(0, 16).replace("T", " ")
                        : ""}
                    </span>

                    {user &&
                      (user.id === comment.accountId || user.role === "admin") && (
                        <button
                          className="comment-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={busy}
                        >
                          삭제
                        </button>
                      )}
                  </div>

                  <div className="comment-text">{comment.text}</div>
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
                  onChange={(event) => setNewComment(event.target.value)}
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
              <div className="comments-login-hint">
                댓글 작성은 로그인 후 가능합니다.
              </div>
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

      {/* 공지 검색 및 필터 */}
      <div className="notice-toolbar">
        <div className="notice-cat-row">
          {categoryList.map((item) => (
            <button
              key={item}
              className={category === item ? "cat-filter-btn active" : "cat-filter-btn"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="form-control-fc notice-search"
          placeholder="검색..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {sortedNotices.length === 0 ? (
        <div className="notice-empty">검색 결과가 없습니다.</div>
      ) : (
        <div className="row g-4">
          {sortedNotices.map((notice) => (
            <div className="col-md-6" key={notice.id}>
              <NoticeCard
                notice={notice}
                onClick={openNotice}
                compact={false}
              />
            </div>
          ))}
        </div>
      )}

      {user && user.role === "admin" && (
        <div className="notice-admin-hint">
          관리자 페이지에서 공지를 추가할 수 있습니다.
        </div>
      )}
    </div>
  );
}

export default Notice;

