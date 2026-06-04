const bcrypt = require("bcrypt");
const { pool } = require("../db");

const ADMIN_DEFAULT_PW = "admin1234";

const members = [
  {
    number: 77,
    name: "차형창",
    nameEn: "Hyeong-chang Cha",
    position: "FW",
    role: "Captain",
    year: 22,
    goals: 14,
    assists: 6,
    cleanSheets: 0,
    matches: 18,
    bio: "팀의 주장이자 에이스 스트라이커. 빠른 발과 정확한 결정력으로 팀 공격을 이끈다."
  },
  {
    number: 17,
    name: "이성준",
    nameEn: "Seong-jun Lee",
    position: "MF",
    role: "Vice-Captain",
    year: 21,
    goals: 5,
    assists: 11,
    cleanSheets: 0,
    matches: 17,
    bio: "경기 흐름을 조율하는 미드필더. 패스 정확도와 시야가 강점."
  },
  {
    number: 29,
    name: "김태효",
    nameEn: "Tae-hyo Kim",
    position: "DF",
    role: "Manager",
    year: 22,
    goals: 1,
    assists: 2,
    cleanSheets: 0,
    matches: 16,
    bio: "수비의 핵심. 안정적인 빌드업으로 후방을 책임진다."
  },
  {
    number: 1,
    name: "박지훈",
    nameEn: "Ji-hoon Park",
    position: "GK",
    role: "Member",
    year: 23,
    goals: 0,
    assists: 0,
    cleanSheets: 7,
    matches: 18,
    bio: "뛰어난 반사신경의 골키퍼."
  },
  {
    number: 8,
    name: "정민혁",
    nameEn: "Min-hyuk Jung",
    position: "MF",
    role: "Member",
    year: 23,
    goals: 3,
    assists: 7,
    cleanSheets: 0,
    matches: 15,
    bio: "활동량이 많은 박스 투 박스 미드필더."
  },
  {
    number: 11,
    name: "한승우",
    nameEn: "Seung-woo Han",
    position: "FW",
    role: "Member",
    year: 24,
    goals: 9,
    assists: 4,
    cleanSheets: 0,
    matches: 16,
    bio: "드리블에 능한 윙어. 측면을 무너뜨리는 유형."
  },
  {
    number: 5,
    name: "오재현",
    nameEn: "Jae-hyeon Oh",
    position: "DF",
    role: "Member",
    year: 22,
    goals: 0,
    assists: 1,
    cleanSheets: 0,
    matches: 17,
    bio: "제공권에 강한 센터백."
  },
  {
    number: 23,
    name: "서동훈",
    nameEn: "Dong-hoon Seo",
    position: "MF",
    role: "Member",
    year: 24,
    goals: 2,
    assists: 5,
    cleanSheets: 0,
    matches: 14,
    bio: "세트피스 키커. 정확한 왼발 크로스."
  },
  {
    number: 4,
    name: "윤성호",
    nameEn: "Seong-ho Yoon",
    position: "DF",
    role: "Member",
    year: 21,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    matches: 18,
    bio: "풀백. 공격 가담과 수비 복귀가 빠르다."
  },
  {
    number: 9,
    name: "강재민",
    nameEn: "Jae-min Kang",
    position: "FW",
    role: "Member",
    year: 23,
    goals: 8,
    assists: 3,
    cleanSheets: 0,
    matches: 15,
    bio: "포스트 플레이에 강한 스트라이커."
  },
  {
    number: 14,
    name: "신현우",
    nameEn: "Hyun-woo Shin",
    position: "MF",
    role: "Member",
    year: 24,
    goals: 4,
    assists: 2,
    cleanSheets: 0,
    matches: 13,
    bio: "먼 거리 슛이 강점인 공격형 미드필더."
  },
  {
    number: 21,
    name: "문지원",
    nameEn: "Ji-won Moon",
    position: "GK",
    role: "Member",
    year: 24,
    goals: 0,
    assists: 0,
    cleanSheets: 2,
    matches: 4,
    bio: "백업 골키퍼. 페널티킥 선방 전문."
  }
];

function dateFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const matches = [
  {
    date: dateFromToday(3),
    time: "15:00",
    opponent: "EE United",
    dept: "전자공학과",
    venue: "학생회관 운동장",
    type: "League",
    sport: "football",
    status: "upcoming",
    ha: "home",
    so: null,
    st: null
  },
  {
    date: dateFromToday(7),
    time: "20:00",
    opponent: "EE Futsal",
    dept: "전자공학과",
    venue: "실내 체육관",
    type: "League",
    sport: "futsal",
    status: "upcoming",
    ha: "home",
    so: null,
    st: null
  },
  {
    date: dateFromToday(10),
    time: "14:00",
    opponent: "ME FC",
    dept: "기계공학과",
    venue: "제2운동장",
    type: "League",
    sport: "football",
    status: "upcoming",
    ha: "away",
    so: null,
    st: null
  },
  {
    date: dateFromToday(14),
    time: "20:00",
    opponent: "CE Futsal",
    dept: "컴퓨터공학과",
    venue: "실내 체육관",
    type: "Friendly",
    sport: "futsal",
    status: "upcoming",
    ha: "home",
    so: null,
    st: null
  },
  {
    date: dateFromToday(17),
    time: "16:00",
    opponent: "CE Eagles",
    dept: "컴퓨터공학과",
    venue: "학생회관 운동장",
    type: "Cup",
    sport: "football",
    status: "upcoming",
    ha: "home",
    so: null,
    st: null
  },
  {
    date: dateFromToday(-7),
    time: "15:00",
    opponent: "CHEM Lions",
    dept: "화학공학과",
    venue: "학생회관 운동장",
    type: "League",
    sport: "football",
    status: "finished",
    ha: "home",
    so: 3,
    st: 1
  },
  {
    date: dateFromToday(-14),
    time: "14:00",
    opponent: "BIO Wolves",
    dept: "생명공학과",
    venue: "제2운동장",
    type: "League",
    sport: "football",
    status: "finished",
    ha: "away",
    so: 2,
    st: 2
  },
  {
    date: dateFromToday(-21),
    time: "15:00",
    opponent: "PHY United",
    dept: "물리학과",
    venue: "학생회관 운동장",
    type: "Friendly",
    sport: "football",
    status: "finished",
    ha: "home",
    so: 4,
    st: 0
  },
  {
    date: dateFromToday(-28),
    time: "15:00",
    opponent: "MATH FC",
    dept: "수학과",
    venue: "제2운동장",
    type: "League",
    sport: "football",
    status: "finished",
    ha: "away",
    so: 1,
    st: 2
  },
  {
    date: dateFromToday(-10),
    time: "20:00",
    opponent: "BIO Futsal",
    dept: "생명공학과",
    venue: "실내 체육관",
    type: "League",
    sport: "futsal",
    status: "finished",
    ha: "home",
    so: 5,
    st: 3
  }
];

const notices = [
  {
    title: "2026년 5월 정기 회의 안내",
    category: "공지",
    author: "CLASS FC 운영진",
    pinned: true,
    important: true,
    daysAgo: 2,
    content: `안녕하세요, CLASS FC 운영진입니다.\n\n5월 정기 회의를 아래와 같이 진행합니다.\n\n일시: 2026년 5월 26일 (화) 오후 7시\n장소: 소프트웨어학과 세미나실 (공학관 5층)\n\n논의 안건:\n1. 5월 경기 리뷰\n2. 6월 컵 대회 일정 확정\n3. 신입 부원 환영회 일정\n4. 유니폼 추가 제작 건\n\n필참 부탁드립니다.`
  },
  {
    title: "5/24 EE United 전 라인업 안내",
    category: "경기",
    author: "차형창",
    pinned: true,
    important: false,
    daysAgo: 1,
    content: `5월 24일 EE United 와의 리그 경기 라인업입니다.\n\n선발 11인:\nGK 박지훈 / DF 윤성호 김태효 오재현 / MF 이성준 정민혁 서동훈 / FW 한승우 차형창 강재민 / 신현우\n\n집결: 14:00 학생회관 운동장 앞\n워밍업: 14:20 부터\n킥오프: 15:00`
  },
  {
    title: "신입 부원 모집 (~5/31까지)",
    category: "모집",
    author: "김태효",
    pinned: false,
    important: false,
    daysAgo: 6,
    content: `CLASS FC 신입 부원을 모집합니다.\n\n자격: 소프트웨어학과 재학생 (학년 무관)\n인원: 4명 내외\n지원: 운영진에게 DM 또는 이메일`
  },
  {
    title: "5/17 CHEM Lions 전 승리 후기 3-1",
    category: "경기",
    author: "이성준",
    pinned: false,
    important: false,
    daysAgo: 4,
    content: `오늘 경기 다들 수고 많으셨습니다.\n\n전반 차형창 선수 선제골 이후 후반에 한승우, 강재민 선수의 추가골로 3-1 승리했습니다.`
  },
  {
    title: "유니폼 사이즈 재조사",
    category: "운영",
    author: "CLASS FC 운영진",
    pinned: false,
    important: false,
    daysAgo: 9,
    content: `상반기 유니폼 추가 제작을 위해 사이즈를 다시 조사합니다.\n\n신청 폼에 본인 이름, 등번호, 사이즈, 마킹 영문을 기입해 주세요.\n마감: 5/22 (목) 자정`
  },
  {
    title: "동아리 회비 납부 안내 (2026 상반기)",
    category: "운영",
    author: "김태효",
    pinned: false,
    important: true,
    daysAgo: 16,
    content: `2026년 상반기 동아리 회비 납부 안내입니다.\n\n금액: 30,000원\n계좌: 농협 1234-5678-9012 (CLASS FC)\n마감: 5/20`
  }
];

const gallery = [
  {
    title: "vs CHEM Lions 승리 직후",
    tag: "Match",
    gradient: "linear-gradient(135deg, #00d166 0%, #112940 100%)",
    icon: "trophy",
    date: "2026-05-17"
  },
  {
    title: "단체 사진 - 시즌 개막",
    tag: "Team",
    gradient: "linear-gradient(135deg, #4a90e2 0%, #050b18 100%)",
    icon: "team",
    date: "2026-03-15"
  },
  {
    title: "주장 차형창의 해트트릭",
    tag: "Highlight",
    gradient: "linear-gradient(135deg, #ff4d5e 0%, #112940 100%)",
    icon: "star",
    date: "2026-04-26"
  },
  {
    title: "훈련 - 패스 연습",
    tag: "Training",
    gradient: "linear-gradient(135deg, #f5a623 0%, #050b18 100%)",
    icon: "training",
    date: "2026-05-08"
  },
  {
    title: "신입 부원 환영회",
    tag: "Event",
    gradient: "linear-gradient(135deg, #00d166 0%, #4a90e2 100%)",
    icon: "event",
    date: "2026-03-22"
  },
  {
    title: "경기장으로",
    tag: "Match",
    gradient: "linear-gradient(135deg, #112940 0%, #00d166 100%)",
    icon: "field",
    date: "2026-05-10"
  },
  {
    title: "동아리 체육대회",
    tag: "Event",
    gradient: "linear-gradient(135deg, #4a90e2 0%, #00d166 100%)",
    icon: "event",
    date: "2026-04-12"
  },
  {
    title: "베스트 일레븐 발표",
    tag: "Highlight",
    gradient: "linear-gradient(135deg, #f5a623 0%, #ff4d5e 100%)",
    icon: "star",
    date: "2026-05-19"
  },
  {
    title: "워밍업",
    tag: "Training",
    gradient: "linear-gradient(135deg, #050b18 0%, #4a90e2 100%)",
    icon: "training",
    date: "2026-05-03"
  },
  {
    title: "시즌 첫 골",
    tag: "Highlight",
    gradient: "linear-gradient(135deg, #00d166 0%, #f5a623 100%)",
    icon: "star",
    date: "2026-03-29"
  },
  {
    title: "응원 온 팬들",
    tag: "Event",
    gradient: "linear-gradient(135deg, #ff4d5e 0%, #f5a623 100%)",
    icon: "event",
    date: "2026-04-19"
  },
  {
    title: "팀 미팅",
    tag: "Team",
    gradient: "linear-gradient(135deg, #112940 0%, #4a90e2 100%)",
    icon: "team",
    date: "2026-04-05"
  }
];

function daysAgoDate(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

async function run() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash(ADMIN_DEFAULT_PW, 10);
  await pool.query("DELETE FROM accounts WHERE username = ?", ["admin"]);
  await pool.query(
    `INSERT INTO accounts (username, password_hash, name, number, role) VALUES (?, ?, ?, ?, ?)`,
    ["admin", adminHash, "운영자", "00", "admin"]
  );
  console.log(`✓ admin account (login: admin / ${ADMIN_DEFAULT_PW})`);

  await pool.query("DELETE FROM members");
  for (const m of members) {
    await pool.query(
      `INSERT INTO members (number, name, name_en, position, role, year, goals, assists, clean_sheets, matches_played, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.number,
        m.name,
        m.nameEn,
        m.position,
        m.role,
        m.year,
        m.goals,
        m.assists,
        m.cleanSheets,
        m.matches,
        m.bio
      ]
    );
  }
  console.log(`✓ ${members.length} members`);

  await pool.query("DELETE FROM matches");
  for (const m of matches) {
    await pool.query(
      `INSERT INTO matches (match_date, match_time, opponent, opponent_dept, venue, match_type, sport, status, home_away, score_ours, score_theirs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.date, m.time, m.opponent, m.dept, m.venue, m.type, m.sport, m.status, m.ha, m.so, m.st]
    );
  }
  console.log(`✓ ${matches.length} matches`);

  await pool.query("DELETE FROM notices");
  for (const n of notices) {
    await pool.query(
      `INSERT INTO notices (title, category, author_name, content, pinned, important, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [n.title, n.category, n.author, n.content, n.pinned, n.important, daysAgoDate(n.daysAgo)]
    );
  }
  console.log(`✓ ${notices.length} notices`);

  await pool.query("DELETE FROM gallery");
  for (const g of gallery) {
    await pool.query(
      `INSERT INTO gallery (title, tag, gradient, icon, taken_date)
       VALUES (?, ?, ?, ?, ?)`,
      [g.title, g.tag, g.gradient, g.icon, g.date]
    );
  }
  console.log(`✓ ${gallery.length} gallery items`);

  console.log("\nDone. 관리자: admin / " + ADMIN_DEFAULT_PW);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
