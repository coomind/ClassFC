import { useEffect } from "react";
import { youtubeEmbed } from "../data/youtube";

function GalleryModal({ item, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!item) return null;

  const iconMap = {
    trophy: "◆",
    team: "●●●",
    star: "★",
    training: "▶",
    event: "◉",
    field: "▣"
  };

  const isYt = item.mediaType === "youtube";

  return (
    <div className="gallery-modal-backdrop" onClick={onClose}>
      <div className="gallery-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="gallery-modal-close" onClick={onClose}>
          ×
        </button>

        {isYt ? (
          <div className="gallery-modal-video">
            <iframe
              src={youtubeEmbed(item.imageUrl)}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : item.imageUrl ? (
          <div className="gallery-modal-photo">
            <img src={item.imageUrl} alt={item.title} />
          </div>
        ) : (
          <div className="gallery-modal-image" style={{ background: item.gradient }}>
            <div className="gallery-modal-icon">{iconMap[item.icon] || "●"}</div>
          </div>
        )}

        <div className="gallery-modal-info">
          <div className="gallery-modal-tag">{item.tag}</div>
          <h3 className="gallery-modal-title">{item.title}</h3>
          <div className="gallery-modal-date">{item.date}</div>
        </div>
      </div>
    </div>
  );
}

export default GalleryModal;
