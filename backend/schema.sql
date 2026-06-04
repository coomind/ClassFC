SET NAMES utf8mb4;

DROP TABLE IF EXISTS lineup_slots;
DROP TABLE IF EXISTS lineups;
DROP TABLE IF EXISTS motm_votes;
DROP TABLE IF EXISTS rsvp;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(40) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(40) NOT NULL,
  number VARCHAR(8),
  email VARCHAR(120) UNIQUE,
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  number INT NOT NULL,
  name VARCHAR(40) NOT NULL,
  name_en VARCHAR(80),
  position ENUM('GK', 'DF', 'MF', 'FW') NOT NULL,
  role VARCHAR(30) DEFAULT 'Member',
  year INT,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  clean_sheets INT DEFAULT 0,
  matches_played INT DEFAULT 0,
  bio TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  opponent VARCHAR(60) NOT NULL,
  opponent_dept VARCHAR(60),
  venue VARCHAR(120),
  match_type ENUM('League', 'Cup', 'Friendly') DEFAULT 'League',
  sport ENUM('football', 'futsal') DEFAULT 'football',
  status ENUM('upcoming', 'finished', 'cancelled') DEFAULT 'upcoming',
  home_away ENUM('home', 'away') DEFAULT 'home',
  score_ours INT,
  score_theirs INT,
  appearance_counted BOOLEAN DEFAULT FALSE,
  INDEX idx_status_date (status, match_date),
  INDEX idx_sport (sport)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category ENUM('공지', '경기', '모집', '운영') NOT NULL,
  author_id INT,
  author_name VARCHAR(40),
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  important BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES accounts(id) ON DELETE SET NULL,
  INDEX idx_cat (category, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id INT NOT NULL,
  account_id INT,
  author_name VARCHAR(40) NOT NULL,
  author_number VARCHAR(8),
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  INDEX idx_notice (notice_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rsvp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  account_id INT NOT NULL,
  status ENUM('attend', 'late') NOT NULL,
  responded_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_match_account (match_id, account_id),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE motm_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  voter_account_id INT NOT NULL,
  voted_member_id INT NOT NULL,
  voted_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_match_voter (match_id, voter_account_id),
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (voter_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (voted_member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lineups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL UNIQUE,
  lineup_type ENUM('football', 'futsal') DEFAULT 'football',
  formation VARCHAR(20) NOT NULL,
  published_by INT,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (published_by) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lineup_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lineup_id INT NOT NULL,
  slot_id VARCHAR(20) NOT NULL,
  member_id INT NOT NULL,
  UNIQUE KEY uk_lineup_slot (lineup_id, slot_id),
  FOREIGN KEY (lineup_id) REFERENCES lineups(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  tag ENUM('Match', 'Training', 'Team', 'Highlight', 'Event') DEFAULT 'Match',
  image_url VARCHAR(255),
  gradient VARCHAR(200),
  icon VARCHAR(20),
  taken_date DATE,
  uploaded_by INT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
