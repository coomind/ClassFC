import { useState, useEffect } from "react";
import { formations, formationSizes } from "../data/formations";
import { positionColor } from "../data/constants";
import api from "../api";
import "../styles/squad.css";

function SquadMaker({ members, matches, user }) {
  const savedDraft = JSON.parse(
    localStorage.getItem("classfc_squad_draft") || "null"
  );

  const [type, setType] = useState(savedDraft ? savedDraft.type : "football");
  const [formation, setFormation] = useState(
    savedDraft ? savedDraft.formation : "4-3-3"
  );
  const [assignments, setAssignments] = useState(
    savedDraft ? savedDraft.assignments : {}
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetMatch, setTargetMatch] = useState("");
  const [publishMsg, setPublishMsg] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [dragSource, setDragSource] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [listIsDropTarget, setListIsDropTarget] = useState(false);

  const slots = formations[type][formation] || [];

  // 스쿼드 임시 저장
  useEffect(() => {
    localStorage.setItem(
      "classfc_squad_draft",
      JSON.stringify({ type, formation, assignments })
    );
  }, [type, formation, assignments]);

  const changeType = (nextType) => {
    setType(nextType);

    const firstFormation = Object.keys(formations[nextType])[0];
    setFormation(firstFormation);
    setAssignments({});
    setSelectedSlot(null);
    setPublishMsg("");
  };

  const changeFormation = (nextFormation) => {
    setFormation(nextFormation);
    setAssignments({});
    setSelectedSlot(null);
  };

  const findMember = (id) => {
    return members.find((member) => String(member.id) === String(id));
  };

  const handleSlotClick = (slotId) => {
    if (assignments[slotId]) {
      const newAssignments = { ...assignments };
      delete newAssignments[slotId];

      setAssignments(newAssignments);
      setSelectedSlot(slotId);
    } else {
      setSelectedSlot(slotId);
    }
  };

  // 선택한 슬롯에 선수 배치
  const assignSlot = (slotId, memberId) => {
    const newAssignments = { ...assignments };

    for (const id in newAssignments) {
      if (String(newAssignments[id]) === String(memberId)) {
        delete newAssignments[id];
      }
    }

    newAssignments[slotId] = memberId;
    setAssignments(newAssignments);

    const nextEmpty = slots.find((slot) => !newAssignments[slot.id]);
    setSelectedSlot(nextEmpty ? nextEmpty.id : null);
  };

  const handleMemberClick = (memberId) => {
    if (!selectedSlot) {
      const firstEmpty = slots.find((slot) => !assignments[slot.id]);

      if (!firstEmpty) {
        return;
      }

      assignSlot(firstEmpty.id, memberId);
    } else {
      assignSlot(selectedSlot, memberId);
    }
  };

  // 선수 드래그 시작
  const handleMemberDragStart = (memberId, event) => {
    const data = { type: "member", memberId };

    setDragSource(data);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  // 슬롯 드래그 시작
  const handleSlotDragStart = (slotId, event) => {
    if (!assignments[slotId]) {
      event.preventDefault();
      return;
    }

    const data = { type: "slot", slotId };

    setDragSource(data);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleDragEnd = () => {
    setDragSource(null);
    setDragOverSlot(null);
    setListIsDropTarget(false);
  };

  const handleSlotDragOver = (slotId, event) => {
    event.preventDefault();

    if (dragOverSlot !== slotId) {
      setDragOverSlot(slotId);
    }
  };

  const handleSlotDragLeave = () => {
    setDragOverSlot(null);
  };

  const readDragData = (event) => {
    try {
      return JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (error) {
      return dragSource;
    }
  };

  // 슬롯에 드롭했을 때 배치 또는 교환
  const handleSlotDrop = (targetSlotId, event) => {
    event.preventDefault();

    const source = readDragData(event);

    setDragOverSlot(null);
    setDragSource(null);

    if (!source) {
      return;
    }

    if (source.type === "member") {
      assignSlot(targetSlotId, source.memberId);
      return;
    }

    if (source.type === "slot") {
      const fromSlot = source.slotId;

      if (fromSlot === targetSlotId) {
        return;
      }

      const newAssignments = { ...assignments };
      const fromMember = newAssignments[fromSlot];
      const toMember = newAssignments[targetSlotId];

      if (toMember) {
        newAssignments[fromSlot] = toMember;
      } else {
        delete newAssignments[fromSlot];
      }

      newAssignments[targetSlotId] = fromMember;
      setAssignments(newAssignments);

      const nextEmpty = slots.find((slot) => !newAssignments[slot.id]);
      setSelectedSlot(nextEmpty ? nextEmpty.id : null);
    }
  };

  const handleListDragOver = (event) => {
    if (dragSource && dragSource.type === "slot") {
      event.preventDefault();
      setListIsDropTarget(true);
    }
  };

  const handleListDragLeave = () => {
    setListIsDropTarget(false);
  };

  // 명단으로 드롭하면 배치 해제
  const handleListDrop = (event) => {
    event.preventDefault();

    const source = readDragData(event);

    setListIsDropTarget(false);
    setDragSource(null);

    if (!source || source.type !== "slot") {
      return;
    }

    const newAssignments = { ...assignments };
    delete newAssignments[source.slotId];

    setAssignments(newAssignments);
    setSelectedSlot(source.slotId);
  };

  const handleReset = () => {
    if (Object.keys(assignments).length === 0) {
      return;
    }

    if (!window.confirm("정말 스쿼드를 초기화하시겠어요?")) {
      return;
    }

    setAssignments({});
    setSelectedSlot(slots[0] ? slots[0].id : null);
  };

  // 관리자 라인업 게시
  const handlePublish = async () => {
    if (!targetMatch) {
      setPublishMsg("게시할 경기를 선택해 주세요.");
      return;
    }

    const filledCount = Object.keys(assignments).length;
    const requiredCount = formationSizes[type];

    if (filledCount < requiredCount) {
      if (
        !window.confirm(
          `아직 ${requiredCount - filledCount}자리가 비어있습니다. 그래도 게시할까요?`
        )
      ) {
        return;
      }
    }

    try {
      await api.post(`/api/matches/${targetMatch}/lineup`, {
        type,
        formation,
        assignments,
      });

      setPublishMsg("라인업이 게시되었습니다. Schedule 페이지에서 부원이 확인할 수 있습니다.");
      setTimeout(() => setPublishMsg(""), 4000);
    } catch (error) {
      setPublishMsg("게시 실패: " + error.message);
    }
  };

  const usedIds = new Set(Object.values(assignments).map(String));

  const filteredMembers = members.filter((member) => {
    if (!memberFilter) {
      return true;
    }

    const keyword = memberFilter.toLowerCase();

    return (
      member.name.toLowerCase().includes(keyword) ||
      member.nameEn.toLowerCase().includes(keyword) ||
      String(member.number).includes(keyword) ||
      member.position.toLowerCase().includes(keyword)
    );
  });

  const upcomingMatches = matches
    .filter((match) => match.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));

  const filledCount = Object.keys(assignments).length;
  const totalSlots = slots.length;

  return (
    <div className="squad-page">
      <div className="container squad-container">
        <div className="squad-head">
          <div>
            <div className="section-subtitle">SQUAD MAKER</div>
            <h2 className="section-title">
              {type === "futsal" ? "풋살" : "축구"} 스쿼드 메이커
            </h2>

            <div className="squad-sub">
              부원을 선택해 포메이션에 배치하고, 다음 경기 라인업으로 게시할 수 있습니다.
              <br />
              <span className="squad-hint-inline">
                Tip · 부원을 슬롯으로 끌어 놓거나, 슬롯끼리 끌어서 위치 교환, 슬롯에서 명단으로
                끌어서 제외할 수 있습니다.
              </span>
            </div>
          </div>

          <div className="squad-type-tabs">
            <button
              className={type === "football" ? "sq-type active" : "sq-type"}
              onClick={() => changeType("football")}
            >
              ⚽ 축구 (11인)
            </button>

            <button
              className={type === "futsal" ? "sq-type active" : "sq-type"}
              onClick={() => changeType("futsal")}
            >
              🤾 풋살 (5인)
            </button>
          </div>
        </div>

        <div className="squad-layout">
          <aside className="squad-sidebar">
            <div className="squad-control-block">
              <label className="label-fc">포메이션</label>
              <select
                className="form-control-fc"
                value={formation}
                onChange={(event) => changeFormation(event.target.value)}
              >
                {Object.keys(formations[type]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="squad-progress">
              배치 {filledCount} / {totalSlots}

              <div className="squad-progress-bar">
                <div
                  className="squad-progress-fill"
                  style={{ width: `${(filledCount / totalSlots) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="squad-members-block">
              <div className="squad-members-head">
                <span className="label-fc">학회 등록 부원</span>
                <span className="squad-hint">
                  {selectedSlot ? `→ ${selectedSlot} 자리에 배치` : "슬롯 먼저 클릭"}
                </span>
              </div>

              <input
                type="text"
                className="form-control-fc squad-search"
                placeholder="이름·번호·포지션 검색"
                value={memberFilter}
                onChange={(event) => setMemberFilter(event.target.value)}
              />

              <div
                className={
                  listIsDropTarget
                    ? "squad-members-list drop-target"
                    : "squad-members-list"
                }
                onDragOver={handleListDragOver}
                onDragLeave={handleListDragLeave}
                onDrop={handleListDrop}
              >
                {filteredMembers.map((member) => {
                  const used = usedIds.has(String(member.id));

                  return (
                    <div
                      key={member.id}
                      className={used ? "squad-mem-row used" : "squad-mem-row"}
                      onClick={() => !used && handleMemberClick(member.id)}
                      draggable={!used}
                      onDragStart={(event) => handleMemberDragStart(member.id, event)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="squad-mem-num">{member.number}</span>
                      <span className="squad-mem-name">{member.name}</span>

                      <span
                        className="squad-mem-pos"
                        style={{
                          background: positionColor[member.position] + "22",
                          color: positionColor[member.position],
                        }}
                      >
                        {member.position}
                      </span>

                      {used && <span className="squad-used-tag">배치됨</span>}
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="squad-empty-list">검색 결과 없음</div>
                )}
              </div>
            </div>

            <button className="squad-reset-btn" onClick={handleReset}>
              ↺ 스쿼드 초기화
            </button>

            {user && user.role === "admin" && (
              <div className="squad-publish">
                <div className="label-fc">관리자 — 다음 경기 라인업으로 게시</div>

                <select
                  className="form-control-fc mt-2"
                  value={targetMatch}
                  onChange={(event) => setTargetMatch(event.target.value)}
                >
                  <option value="">경기 선택...</option>

                  {upcomingMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.date} vs {match.opponent} (
                      {match.sport === "futsal" ? "풋살" : "축구"})
                    </option>
                  ))}
                </select>

                <button
                  className="btn-primary-green squad-publish-btn"
                  onClick={handlePublish}
                >
                  라인업으로 게시
                </button>

                {publishMsg && (
                  <div className="squad-publish-msg">{publishMsg}</div>
                )}
              </div>
            )}
          </aside>

          <div className="squad-pitch-wrap">
            <div className={`squad-pitch type-${type}`}>
              {/* 축구장 라인 */}
              <div className="pitch-line center-line"></div>
              <div className="pitch-circle"></div>
              <div className="pitch-box top-box"></div>
              <div className="pitch-box bottom-box"></div>
              <div className="pitch-small-box top-small"></div>
              <div className="pitch-small-box bottom-small"></div>

              {/* 선수 슬롯 */}
              {slots.map((slot) => {
                const memberId = assignments[slot.id];
                const member = memberId ? findMember(memberId) : null;
                const color = member ? positionColor[member.position] : null;
                const isSelected = selectedSlot === slot.id;
                const isDragOver = dragOverSlot === slot.id;
                const isBeingDragged =
                  dragSource &&
                  dragSource.type === "slot" &&
                  dragSource.slotId === slot.id;

                const slotClass = [
                  "pitch-slot",
                  member ? "filled" : "empty",
                  isSelected ? "selected" : "",
                  isDragOver ? "drag-over" : "",
                  isBeingDragged ? "dragging" : "",
                ]
                  .join(" ")
                  .trim();

                return (
                  <div
                    key={slot.id}
                    className={slotClass}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(event) => handleSlotDragOver(slot.id, event)}
                    onDragLeave={handleSlotDragLeave}
                    onDrop={(event) => handleSlotDrop(slot.id, event)}
                  >
                    <div
                      className="pitch-slot-label"
                      style={color ? { color: color } : null}
                    >
                      {slot.label}
                    </div>

                    <div
                      className="pitch-shirt"
                      draggable={!!member}
                      onDragStart={(event) => handleSlotDragStart(slot.id, event)}
                      onDragEnd={handleDragEnd}
                      style={color ? { backgroundColor: color } : null}
                    >
                      {member ? (
                        <span className="pitch-shirt-num">{member.number}</span>
                      ) : (
                        <span className="pitch-shirt-empty">+</span>
                      )}
                    </div>

                    <div className="pitch-slot-name">
                      {member ? member.name : "선수 선택"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="squad-pitch-foot">
              <span className="squad-formation-label">{formation}</span>
              <span className="squad-type-label">
                {type === "futsal" ? "FUTSAL · 5 a side" : "FOOTBALL · 11 a side"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SquadMaker;

/*
import { useState, useEffect } from "react";
import { formations, formationSizes } from "../data/formations";
import { positionColor } from "../data/constants";
import api from "../api";
import "../styles/squad.css";

function SquadMaker({ members, matches, user }) {
  const draft = JSON.parse(localStorage.getItem("classfc_squad_draft") || "null");

  const [type, setType] = useState(draft ? draft.type : "football");
  const [formation, setFormation] = useState(draft ? draft.formation : "4-3-3");
  const [assignments, setAssignments] = useState(draft ? draft.assignments : {});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetMatch, setTargetMatch] = useState("");
  const [publishMsg, setPublishMsg] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [dragSource, setDragSource] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [listIsDropTarget, setListIsDropTarget] = useState(false);

  const slots = formations[type][formation] || [];

  useEffect(() => {
    localStorage.setItem("classfc_squad_draft", JSON.stringify({ type, formation, assignments }));
  }, [type, formation, assignments]);

  const handleTypeChange = (t) => {
    setType(t);
    const first = Object.keys(formations[t])[0];
    setFormation(first);
    setAssignments({});
    setSelectedSlot(null);
    setPublishMsg("");
  };

  const handleFormationChange = (f) => {
    setFormation(f);
    setAssignments({});
    setSelectedSlot(null);
  };

  const handleSlotClick = (slotId) => {
    if (assignments[slotId]) {
      const updated = { ...assignments };
      delete updated[slotId];
      setAssignments(updated);
      setSelectedSlot(slotId);
    } else {
      setSelectedSlot(slotId);
    }
  };

  const assignSlot = (slotId, memberId) => {
    const updated = { ...assignments };
    for (const sid in updated) {
      if (String(updated[sid]) === String(memberId)) delete updated[sid];
    }
    updated[slotId] = memberId;
    setAssignments(updated);
    const nextEmpty = slots.find((s) => !updated[s.id]);
    setSelectedSlot(nextEmpty ? nextEmpty.id : null);
  };

  const handleMemberClick = (memberId) => {
    if (!selectedSlot) {
      const firstEmpty = slots.find((s) => !assignments[s.id]);
      if (!firstEmpty) return;
      assignSlot(firstEmpty.id, memberId);
    } else {
      assignSlot(selectedSlot, memberId);
    }
  };

  const handleMemberDragStart = (memberId, e) => {
    const data = { type: "member", memberId };
    setDragSource(data);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleSlotDragStart = (slotId, e) => {
    if (!assignments[slotId]) {
      e.preventDefault();
      return;
    }
    const data = { type: "slot", slotId };
    setDragSource(data);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleDragEnd = () => {
    setDragSource(null);
    setDragOverSlot(null);
    setListIsDropTarget(false);
  };

  const handleSlotDragOver = (slotId, e) => {
    e.preventDefault();
    if (dragOverSlot !== slotId) setDragOverSlot(slotId);
  };

  const handleSlotDragLeave = () => {
    setDragOverSlot(null);
  };

  const readDragData = (e) => {
    try {
      return JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return dragSource;
    }
  };

  const handleSlotDrop = (targetSlotId, e) => {
    e.preventDefault();
    const src = readDragData(e);
    setDragOverSlot(null);
    setDragSource(null);
    if (!src) return;

    if (src.type === "member") {
      assignSlot(targetSlotId, src.memberId);
      return;
    }

    if (src.type === "slot") {
      const fromSlot = src.slotId;
      if (fromSlot === targetSlotId) return;
      const updated = { ...assignments };
      const fromMember = updated[fromSlot];
      const toMember = updated[targetSlotId];
      if (toMember) {
        updated[fromSlot] = toMember;
      } else {
        delete updated[fromSlot];
      }
      updated[targetSlotId] = fromMember;
      setAssignments(updated);
      const nextEmpty = slots.find((s) => !updated[s.id]);
      setSelectedSlot(nextEmpty ? nextEmpty.id : null);
    }
  };

  const handleListDragOver = (e) => {
    if (dragSource && dragSource.type === "slot") {
      e.preventDefault();
      setListIsDropTarget(true);
    }
  };

  const handleListDragLeave = () => {
    setListIsDropTarget(false);
  };

  const handleListDrop = (e) => {
    e.preventDefault();
    const src = readDragData(e);
    setListIsDropTarget(false);
    setDragSource(null);
    if (!src || src.type !== "slot") return;
    const updated = { ...assignments };
    delete updated[src.slotId];
    setAssignments(updated);
    setSelectedSlot(src.slotId);
  };

  const handleReset = () => {
    if (Object.keys(assignments).length === 0) return;
    if (!window.confirm("정말 스쿼드를 초기화하시겠어요?")) return;
    setAssignments({});
    setSelectedSlot(slots[0] ? slots[0].id : null);
  };

  const handlePublish = async () => {
    if (!targetMatch) {
      setPublishMsg("게시할 경기를 선택해 주세요.");
      return;
    }
    const filledCount = Object.keys(assignments).length;
    const required = formationSizes[type];
    if (filledCount < required) {
      if (!window.confirm(`아직 ${required - filledCount}자리가 비어있습니다. 그래도 게시할까요?`))
        return;
    }
    try {
      await api.post(`/api/matches/${targetMatch}/lineup`, { type, formation, assignments });
      setPublishMsg("라인업이 게시되었습니다. Schedule 페이지에서 부원이 확인할 수 있습니다.");
      setTimeout(() => setPublishMsg(""), 4000);
    } catch (e) {
      setPublishMsg("게시 실패: " + e.message);
    }
  };

  const usedIds = new Set(Object.values(assignments).map(String));
  const filteredMembers = members.filter((m) => {
    if (!memberFilter) return true;
    const q = memberFilter.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      String(m.number).includes(q) ||
      m.position.toLowerCase().includes(q)
    );
  });

  const upcomingMatches = matches
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));

  const filledCount = Object.keys(assignments).length;
  const totalSlots = slots.length;

  const findMember = (id) => members.find((m) => String(m.id) === String(id));

  return (
    <div className="squad-page">
      <div className="container squad-container">
        <div className="squad-head">
          <div>
            <div className="section-subtitle">SQUAD MAKER</div>
            <h2 className="section-title">{type === "futsal" ? "풋살" : "축구"} 스쿼드 메이커</h2>
            <div className="squad-sub">
              부원을 선택해 포메이션에 배치하고, 다음 경기 라인업으로 게시할 수 있습니다.
              <br />
              <span className="squad-hint-inline">
                Tip · 부원을 슬롯으로 끌어 놓거나, 슬롯끼리 끌어서 위치 교환, 슬롯에서 명단으로
                끌어서 제외할 수 있습니다.
              </span>
            </div>
          </div>

          <div className="squad-type-tabs">
            <button
              className={type === "football" ? "sq-type active" : "sq-type"}
              onClick={() => handleTypeChange("football")}
            >
              ⚽ 축구 (11인)
            </button>
            <button
              className={type === "futsal" ? "sq-type active" : "sq-type"}
              onClick={() => handleTypeChange("futsal")}
            >
              🤾 풋살 (5인)
            </button>
          </div>
        </div>

        <div className="squad-layout">
          <aside className="squad-sidebar">
            <div className="squad-control-block">
              <label className="label-fc">포메이션</label>
              <select
                className="form-control-fc"
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value)}
              >
                {Object.keys(formations[type]).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="squad-progress">
              배치 {filledCount} / {totalSlots}
              <div className="squad-progress-bar">
                <div
                  className="squad-progress-fill"
                  style={{ width: `${(filledCount / totalSlots) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="squad-members-block">
              <div className="squad-members-head">
                <span className="label-fc">학회 등록 부원</span>
                <span className="squad-hint">
                  {selectedSlot ? `→ ${selectedSlot} 자리에 배치` : "슬롯 먼저 클릭"}
                </span>
              </div>

              <input
                type="text"
                className="form-control-fc squad-search"
                placeholder="이름·번호·포지션 검색"
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
              />

              <div
                className={
                  listIsDropTarget ? "squad-members-list drop-target" : "squad-members-list"
                }
                onDragOver={handleListDragOver}
                onDragLeave={handleListDragLeave}
                onDrop={handleListDrop}
              >
                {filteredMembers.map((m) => {
                  const used = usedIds.has(String(m.id));
                  return (
                    <div
                      key={m.id}
                      className={used ? "squad-mem-row used" : "squad-mem-row"}
                      onClick={() => !used && handleMemberClick(m.id)}
                      draggable={!used}
                      onDragStart={(e) => handleMemberDragStart(m.id, e)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="squad-mem-num">{m.number}</span>
                      <span className="squad-mem-name">{m.name}</span>
                      <span
                        className="squad-mem-pos"
                        style={{
                          background: positionColor[m.position] + "22",
                          color: positionColor[m.position]
                        }}
                      >
                        {m.position}
                      </span>
                      {used && <span className="squad-used-tag">배치됨</span>}
                    </div>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <div className="squad-empty-list">검색 결과 없음</div>
                )}
              </div>
            </div>

            <button className="squad-reset-btn" onClick={handleReset}>
              ↺ 스쿼드 초기화
            </button>

            {user && user.role === "admin" && (
              <div className="squad-publish">
                <div className="label-fc">관리자 — 다음 경기 라인업으로 게시</div>
                <select
                  className="form-control-fc mt-2"
                  value={targetMatch}
                  onChange={(e) => setTargetMatch(e.target.value)}
                >
                  <option value="">경기 선택...</option>
                  {upcomingMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.date} vs {m.opponent} ({m.sport === "futsal" ? "풋살" : "축구"})
                    </option>
                  ))}
                </select>
                <button className="btn-primary-green squad-publish-btn" onClick={handlePublish}>
                  라인업으로 게시
                </button>
                {publishMsg && <div className="squad-publish-msg">{publishMsg}</div>}
              </div>
            )}
          </aside>

          <div className="squad-pitch-wrap">
            <div className={`squad-pitch type-${type}`}>
              <div className="pitch-line center-line"></div>
              <div className="pitch-circle"></div>
              <div className="pitch-box top-box"></div>
              <div className="pitch-box bottom-box"></div>
              <div className="pitch-small-box top-small"></div>
              <div className="pitch-small-box bottom-small"></div>

              {slots.map((slot) => {
                const memberId = assignments[slot.id];
                const m = memberId ? findMember(memberId) : null;
                const isSelected = selectedSlot === slot.id;
                const color = m ? positionColor[m.position] : null;
                const isDragOver = dragOverSlot === slot.id;
                const isBeingDragged =
                  dragSource && dragSource.type === "slot" && dragSource.slotId === slot.id;
                const cls = [
                  "pitch-slot",
                  m ? "filled" : "empty",
                  isSelected ? "selected" : "",
                  isDragOver ? "drag-over" : "",
                  isBeingDragged ? "dragging" : ""
                ]
                  .join(" ")
                  .trim();
                return (
                  <div
                    key={slot.id}
                    className={cls}
                    style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                    onClick={() => handleSlotClick(slot.id)}
                    onDragOver={(e) => handleSlotDragOver(slot.id, e)}
                    onDragLeave={handleSlotDragLeave}
                    onDrop={(e) => handleSlotDrop(slot.id, e)}
                  >
                    <div className="pitch-slot-label" style={color ? { color: color } : null}>
                      {slot.label}
                    </div>
                    <div
                      className="pitch-shirt"
                      draggable={!!m}
                      onDragStart={(e) => handleSlotDragStart(slot.id, e)}
                      onDragEnd={handleDragEnd}
                      style={color ? { backgroundColor: color } : null}
                    >
                      {m ? (
                        <span className="pitch-shirt-num">{m.number}</span>
                      ) : (
                        <span className="pitch-shirt-empty">+</span>
                      )}
                    </div>
                    <div className="pitch-slot-name">{m ? m.name : "선수 선택"}</div>
                  </div>
                );
              })}
            </div>

            <div className="squad-pitch-foot">
              <span className="squad-formation-label">{formation}</span>
              <span className="squad-type-label">
                {type === "futsal" ? "FUTSAL · 5 a side" : "FOOTBALL · 11 a side"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SquadMaker;
*/
