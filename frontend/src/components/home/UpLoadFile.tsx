import { FileText } from "lucide-react";
import "../../styles/UpLoadFile.css";
import * as mammoth from "mammoth";

interface UpLoadFileProps {
  onFileLoaded: (text: string) => void;
}

export default function UpLoadFile({ onFileLoaded }: UpLoadFileProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      if (ext === "txt") {
        const text = await file.text();
        onFileLoaded(text);
      } else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        onFileLoaded(value.trim());
      } else {
        alert("❌ Chỉ hỗ trợ tệp .txt hoặc .docx!");
      }
    } catch (err) {
      console.error("Lỗi khi đọc file:", err);
      alert("Không thể đọc nội dung tệp.");
    }

    e.target.value = "";
  };

  return (
    <label className="ip-upload cursor-pointer">
      <FileText className="ip-icon" />
      <span>Tải lên tệp tin (.txt / .docx)</span>
      <input
        type="file"
        accept=".txt,.docx"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}
