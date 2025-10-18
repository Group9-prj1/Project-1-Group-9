// src/components/home/InputPanel.tsx
import { Sparkles, Download } from "lucide-react";
import { useEffect, useState } from "react";
import OutputPanel from "./OutputPanel";
import UpLoadFile from "./UpLoadFile";
import "../../styles/inputPanel.css";

type Props = {
  originalText?: string;
  summaryText?: string;
  readOnly?: boolean; 
};

export default function InputPanel({
  originalText = "",
  summaryText = "",
  readOnly = false,
}: Props) {
  const [inputText, setInputText] = useState(originalText);
  const maxChars = 2000;

  useEffect(() => {
    setInputText(originalText);
  }, [originalText]);

  return (
    <div className="ip-page">
      <div className="ip-container">
        <div className="ip-hero">
          <div className="ip-hero-row">
            <Sparkles className="ip-hero-icon" />
            <h1 className="ip-title">Tóm tắt văn bản</h1>
          </div>
        </div>

        <div className="ip-panel">
          {/* Ô nhập văn bản gốc */}
          <div className="ip-wrap">
            <div className="ip-card">
              <label className="ip-label">
                <span className="ip-label-dot" />
                Nội dung cần tóm tắt
              </label>

              <div className="ip-field">
                <textarea
                  className={`ip-textarea ${readOnly ? "opacity-90 cursor-not-allowed" : ""}`}
                  placeholder="Nhập hoặc dán văn bản ở đây…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={maxChars}
                  readOnly={readOnly} // ✅ chỉ đọc khi xem chi tiết
                />
              </div>

              <div className="ip-help">
                <span className="ip-hint">
                  💡 Tối đa {maxChars.toLocaleString()} ký tự
                </span>
                <span className="ip-count">
                  {inputText.length.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>

              {/* Các nút vẫn hiển thị, nhưng bị vô hiệu hóa khi readOnly */}
              <div className="ip-actions">
                <UpLoadFile onFileLoaded={setInputText} disabled={readOnly} /> 
                {/* ⬆ thêm prop disabled để khóa nút tải lên */}

                <button
                  type="button"
                  className={`ip-primary ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={readOnly} // ⬆ cũng disable nút “Tóm tắt”
                >
                  <Sparkles className="ip-icon" />
                  <span>Tóm tắt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ô hiển thị kết quả */}
          <div className="ip-wrap">
            <div className="ip-card ip-card-output">
              <label className="ip-label">
                <span className="ip-label-dot ip-label-dot-purple" />
                Kết quả tóm tắt
              </label>

              <OutputPanel text={summaryText} />

              <div className="ip-actions">
                <button
                  className="ip-download"
                  disabled={!summaryText?.trim()}
                  title={
                    summaryText?.trim()
                      ? "Tải kết quả tóm tắt"
                      : "Chưa có kết quả để tải"
                  }
                >
                  <Download className="w-4 h-4" />
                  <span>Tải xuống</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
