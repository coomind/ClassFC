export function extractYouTubeId(input) {
  if (!input) return "";
  const s = String(input).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (let i = 0; i < patterns.length; i++) {
    const m = s.match(patterns[i]);
    if (m) return m[1];
  }
  return "";
}

export function youtubeThumb(id) {
  return id ? "https://img.youtube.com/vi/" + id + "/hqdefault.jpg" : "";
}

export function youtubeEmbed(id) {
  return id ? "https://www.youtube.com/embed/" + id : "";
}
