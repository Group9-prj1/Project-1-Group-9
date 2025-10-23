import { Download, X, FileText, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/DownloadButton.css";

type Format = "txt" | "docx";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORMAT_OPTIONS: Array<{
  label: string;
  value: Format;
  description: string;
  icon: React.ComponentType<any>;
}> = [
  { label: "TXT",  value: "txt",  description: "Plain text file",         icon: FileText },
  { label: "DOCX", value: "docx", description: "Microsoft Word document", icon: FileDown },
];



export default function DownloadButton({
  isOpen,
  onClose,
}: DownloadModalProps) {
  const [selected, setSelected] = useState<Format | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const node = (
    <div className="dl-overlay" role="dialog" aria-modal="true">
      <div className="dl-container" role="document">
        <div className="dl-header">
          <button type="button" className="dl-close" onClick={onClose} aria-label="Đóng">
            <X className="dl-icon" />
          </button>
          <div className="dl-header-main">
            <div className="dl-badge">
              <Download className="dl-icon-badge" />
            </div>
            <h2 className="dl-title">Tải xuống</h2>
            <p className="dl-subtitle">Chọn định dạng tệp muốn xuất</p>
          </div>
        </div>

        <div className="dl-content">
          <div className="dl-options">
            {FORMAT_OPTIONS.map(({ value, label, description, icon: Icon }) => {
              const isSelected = selected === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`dl-option ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelected(value)}
                  aria-pressed={isSelected}
                >
                  <div className="dl-option-left">
                    <div className={`dl-option-icon ${value}`}>
                      <Icon className="dl-icon" />
                    </div>
                    <div className="dl-option-texts">
                      <span className="dl-option-label">{label}</span>
                      <span className="dl-option-desc">{description}</span>
                    </div>
                  </div>
                  <div className="dl-option-dot" aria-hidden />
                </button>
              );
            })}
          </div>

          <div className="dl-actions">
            <button type="button" className="dl-btn dl-btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="dl-btn dl-btn-primary"
              disabled={!selected}
            >
              <Download className="dl-icon" />
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
