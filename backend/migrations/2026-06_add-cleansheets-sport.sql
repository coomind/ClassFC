ALTER TABLE members
  ADD COLUMN clean_sheets INT DEFAULT 0 AFTER assists;

ALTER TABLE matches
  ADD COLUMN sport ENUM('football', 'futsal') DEFAULT 'football' AFTER match_type,
  ADD INDEX idx_sport (sport);
