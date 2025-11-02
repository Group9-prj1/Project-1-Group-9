import { Sparkles, Download, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OutputPanel from "./OutputPanel";
import UpLoadFile from "./UpLoadFile";
import ErrorPanel from "./ErrorPanel";
import DownloadButton from "./DownLoadButton";
import { cleanInputText, predictSummary, hasEmoji,removeEmojis } from "../../services/summaries";  
import "../../styles/InputPanel.css";

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
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const nav = useNavigate();                             

  const [inputText, setInputText] = useState(originalText);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);              

  const maxChars = 2000;

  useEffect(() => {
    setInputText(originalText);
  }, [originalText]);

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
    setErrorMsg(message);
    setErrorOpen(true);
  };

  const canSummarize = !readOnly && Boolean(inputText.trim()) && !loading;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể sao chép nội dung. Vui lòng thử lại.");
      setErrorOpen(true);
    }
  };

  const handleSummarize = async () => {
    if (!canSummarize) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const cleanedText = cleanInputText(inputText);
      const textInput = removeEmojis(cleanedText);
      const res = await predictSummary({ text: textInput }, undefined, {
        timeoutMs: 15000,
      });
      // chuyển sang trang chi tiết/lịch sử của bản tóm tắt vừa tạo
      nav(`/summaries/${res.id}`, { state: { summarizedJustNow: true } });
    } catch (e: any) {
      setErrorMsg(e?.message || "Không thể tóm tắt. Vui lòng thử lại.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    } 
  };
  const handlePasteBlockEmoji = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const raw = e.clipboardData.getData("text") || "";
        if (hasEmoji(raw)) {
          e.preventDefault();
          setErrorMsg("Không cho phép dán emoji/icon vào nội dung.");
          setErrorOpen(true);
        }
  };



  return (
    <div className="ip-page">
      <div className="ip-container">
        {/* Header */}
        <div className="ip-hero">
          <div className="ip-hero-row">
            <Sparkles className="ip-hero-icon" />
            <h1 className="ip-title">Tóm tắt văn bản</h1>
          </div>
        </div>

        {/* Body */}
        <div className="ip-panel">
          {/* Left: Input */}
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
                  onPaste={handlePasteBlockEmoji}
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
                <span className="ip-hint">💡 Tối đa {maxChars.toLocaleString()} ký tự</span>
                <span className="ip-count">
                  {inputText.length.toLocaleString()} / {maxChars.toLocaleString()}
                </span>
              </div>

              <div className="ip-actions">
                <UpLoadFile onFileLoaded={handleFileLoaded} onError={handleUploadError} disabled={readOnly} />

                <button
                  type="button"
                  className={`ip-primary ${!canSummarize ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={!canSummarize}
                  onClick={handleSummarize}
                >
                  <Sparkles className={`ip-icon ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Đang tóm tắt…" : "Tóm tắt"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Output */}
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
                  disabled={isHomePage || !summaryText?.trim()}
                  onClick={() => setDownloadModalOpen(true)}
                >
                  <Download className="w-4 h-4" />
                  <span>Tải xuống</span>
                </button>
                <div className="ip-actions">
                  <button
                    className="ip-copy"
                    disabled={isHomePage || !summaryText?.trim()}
                    onClick={handleCopy}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <ErrorPanel
          open={errorOpen}
          title="Lỗi"
          message={errorMsg}
          onClose={() => setErrorOpen(false)}
        />
        <DownloadButton
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          text={summaryText}
          fileName="van_ban_tom_tat"
          onError={handleUploadError}
        />
      </div>

      {copied && (
        <div className="fixed top-6 inset-x-0 mx-auto w-fit bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in-out z-[9999]">
          Đã sao chép nội dung tóm tắt!
        </div>
      )}
    </div>
  );
}
