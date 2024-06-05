export default function ImageEnlarger({ show, onClose, children }) {
    if (!show) {
    return null;
  }

  return (
    <div className="img-overlay">
      <div className="img-content">
        <button className="img-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
