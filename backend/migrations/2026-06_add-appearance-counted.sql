ALTER TABLE matches
  ADD COLUMN appearance_counted BOOLEAN DEFAULT FALSE AFTER score_theirs;
