import { useState } from "react";
import GalleryModal from "../components/GalleryModal";
import { youtubeThumb } from "../data/youtube";
import "../styles/gallery.css";

function Gallery({ gallery }) {
  const [selected, setSelected] = useState(null);
  const [tag, setTag] = useState("All");

  const tagList = ["All", "Match", "Training", "Team", "Highlight", "Event"];

  const iconList = {
    trophy: "◆",
    team: "●●●",
    star: "★",
    training: "▶",
    event: "◉",
    field: "▣",
  };

  const filteredGallery =
    tag === "All" ? gallery : gallery.filter((item) => item.tag === tag);

  const openGallery = (item) => {
    setSelected(item);
  };

  const closeGallery = () => {
    setSelected(null);
  };

  return (
    <div className="container page-section gallery-page">
      <div className="section-subtitle">MOMENTS</div>
      <h2 className="section-title">CLASS FC 갤러리</h2>

      {/* 태그 필터 */}
      <div className="gallery-filter-row">
        {tagList.map((item) => (
          <button
            key={item}
            className={tag === item ? "gal-tag-btn active" : "gal-tag-btn"}
            onClick={() => setTag(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredGallery.map((item) => {
          const isYoutube = item.mediaType === "youtube";
          const cover = isYoutube ? youtubeThumb(item.imageUrl) : item.imageUrl;

          const tileStyle = cover
            ? { backgroundImage: "url(" + cover + ")" }
            : { background: item.gradient };

          return (
            <div
              key={item.id}
              className={cover ? "gallery-tile has-cover" : "gallery-tile"}
              style={tileStyle}
              onClick={() => openGallery(item)}
            >
              {!cover && (
                <div className="gallery-tile-icon">
                  {iconList[item.icon] || "●"}
                </div>
              )}

              {isYoutube && <div className="gallery-tile-play">▶</div>}

              <div className="gallery-tile-info">
                <div className="gtile-tag">{item.tag}</div>
                <div className="gtile-title">{item.title}</div>
                <div className="gtile-date">{item.date}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGallery.length === 0 && (
        <div className="gallery-empty">해당 태그의 사진이 없습니다.</div>
      )}

      {selected && <GalleryModal item={selected} onClose={closeGallery} />}
    </div>
  );
}

export default Gallery;

/*
import { useState } from "react";
import GalleryModal from "../components/GalleryModal";
import { youtubeThumb } from "../data/youtube";
import "../styles/gallery.css";

function Gallery({ gallery }) {
  const [selected, setSelected] = useState(null);
  const [tag, setTag] = useState("All");

  const tags = ["All", "Match", "Training", "Team", "Highlight", "Event"];
  const filtered = tag === "All" ? gallery : gallery.filter((g) => g.tag === tag);

  const iconMap = {
    trophy: "◆",
    team: "●●●",
    star: "★",
    training: "▶",
    event: "◉",
    field: "▣"
  };

  return (
    <div className="container page-section gallery-page">
      <div className="section-subtitle">MOMENTS</div>
      <h2 className="section-title">CLASS FC 갤러리</h2>

      <div className="gallery-filter-row">
        {tags.map((t) => (
          <button
            key={t}
            className={tag === t ? "gal-tag-btn active" : "gal-tag-btn"}
            onClick={() => setTag(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map((g) => {
          const isYt = g.mediaType === "youtube";
          const cover = isYt ? youtubeThumb(g.imageUrl) : g.imageUrl;
          const tileStyle = cover
            ? { backgroundImage: "url(" + cover + ")" }
            : { background: g.gradient };
          return (
            <div
              key={g.id}
              className={cover ? "gallery-tile has-cover" : "gallery-tile"}
              style={tileStyle}
              onClick={() => setSelected(g)}
            >
              {!cover && <div className="gallery-tile-icon">{iconMap[g.icon] || "●"}</div>}
              {isYt && <div className="gallery-tile-play">▶</div>}
              <div className="gallery-tile-info">
                <div className="gtile-tag">{g.tag}</div>
                <div className="gtile-title">{g.title}</div>
                <div className="gtile-date">{g.date}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="gallery-empty">해당 태그의 사진이 없습니다.</div>}

      {selected && <GalleryModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default Gallery;
*/
