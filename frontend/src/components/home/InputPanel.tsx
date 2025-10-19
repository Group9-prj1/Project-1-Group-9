import { Sparkles, Download } from "lucide-react";
import { useEffect, useState } from "react";
import OutputPanel from "./OutputPanel";
import UpLoadFile from "./UpLoadFile";
import ErrorPanel from "./ErrorPanel";
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
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const maxChars = 2000;

  useEffect(() => {
    setInputText(originalText);
  }, [originalText]);

  //  Xử lý khi tải file lên
  const handleFileLoaded = (text: string) => {
    if (text.length > maxChars) {
      setInputText(text.slice(0, maxChars));
      setNotice(
        `⚠️ Nội dung tải lên dài ${text.length.toLocaleString()} ký tự. Đã tự động cắt xuống ${maxChars.toLocaleString()} ký tự.`
      );
    } else {
      setInputText(text);
      setNotice(null);
    }
  };

  const handleUploadError = (message: string) => {
    setModalMsg(message);
    setModalOpen(true);
  };

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
          <div className="ip-wrap">
            <div className="ip-card">
              <label className="ip-label">
                <span className="ip-label-dot" />
                Nội dung cần tóm tắt
              </label>

              <div className="ip-field">
                <textarea
                  className={`ip-textarea ${
                    readOnly ? "opacity-90 cursor-not-allowed" : ""
                  }`}
                  placeholder="Nhập hoặc dán văn bản ở đây…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={maxChars}
                  readOnly={readOnly}
                />
              </div>

              {notice && (
                <div
                  className="mt-3 flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-50 px-4 py-3 text-black shadow-sm"
                  role="alert"
                >
                  <span className="text-sm font-medium">{notice}</span>
                </div>
              )}

              <div className="ip-help">
                <span className="ip-hint">
                  💡 Tối đa {maxChars.toLocaleString()} ký tự
                </span>
                <span className="ip-count">
                  {inputText.length.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>

              <div className="ip-actions">
                <UpLoadFile
                  onFileLoaded={handleFileLoaded}
                  onError={handleUploadError}
                  disabled={readOnly}
                />

                <button
                  type="button"
                  className={`ip-primary ${
                    readOnly || !inputText.trim()
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={readOnly || !inputText.trim()}
                >
                  <Sparkles className="ip-icon" />
                  <span>Tóm tắt</span>
                </button>
              </div>
            </div>
          </div>

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

        <ErrorPanel
          open={modalOpen}
          title="Lỗi tải tệp"
          message={modalMsg}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
