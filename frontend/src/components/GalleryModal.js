import { useEffect } from "react";
import { youtubeEmbed } from "../data/youtube";

function GalleryModal({ item, onClose }) {
  useEffect(() => {
    // ESC 키로 모달 닫기
    const closeByEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", closeByEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeByEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!item) {
    return null;
  }

  const iconList = {
    trophy: "◆",
    team: "●●●",
    star: "★",
    training: "▶",
    event: "◉",
    field: "▣",
  };

  const isYoutube = item.mediaType === "youtube";

  return (
    <div className="gallery-modal-backdrop" onClick={onClose}>
      <div className="gallery-modal-box" onClick={(event) => event.stopPropagation()}>
        <button className="gallery-modal-close" onClick={onClose}>
          ×
        </button>

        {isYoutube ? (
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
            <div className="gallery-modal-icon">
              {iconList[item.icon] || "●"}
            </div>
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

