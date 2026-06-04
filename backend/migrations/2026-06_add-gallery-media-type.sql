-- Aiven DB 에 한 번 실행
ALTER TABLE gallery
  ADD COLUMN media_type ENUM('image','youtube') DEFAULT 'image' AFTER image_url;
