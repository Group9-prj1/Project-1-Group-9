import { useEffect, useState } from "react";
import { PanelLeftOpen, X } from "lucide-react";
import Header from "../components/home/Header";
import InputPanel from "../components/home/InputPanel";
import HistoryPanel, { HistoryItem } from "../components/home/HistoryPanel";
import { getSummaries, SummaryView } from "../services/summaries";
import { toViRelative } from "../utils/relativeTime";
import { firstWords } from "../utils/firstWords";
import "../styles/HomePage.css";

export default function HomePage() {
  const [openHistory, setOpenHistory] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("token") ?? undefined;
        const data: SummaryView[] = await getSummaries(0, 20, token);

        const mapped: HistoryItem[] = data.map((s) => ({
          id: s.id,
          title: s.original_text || firstWords(s.original_text, 10, 70),
          time: toViRelative(s.created_at),
        }));

        setItems(mapped);
      } catch (e: any) {
        if (e.message?.includes("401")) {
          setItems([]);
          setErr(null);
        } else {
          setErr(e.message ?? "Lỗi tải lịch sử");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <Header />

      <button
        onClick={() => setOpenHistory(true)}
        className="hp-history-btn"
        aria-label="Mở lịch sử"
      >
        <PanelLeftOpen className="h-4 w-4" />
        <span>Lịch sử</span>
      </button>

      <aside
        className={`hp-sidebar ${openHistory ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="hp-sidebar-header">
          <button
            onClick={() => setOpenHistory(false)}
            className="hp-close-btn"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="hp-sidebar-content">
          {loading ? (
            <div className="hp-status-text">Đang tải…</div>
          ) : err ? (
            <div className="hp-status-error">Lỗi: {err}</div>
          ) : (
            <HistoryPanel items={items} className="w-full p-0 bg-transparent shadow-none" />
          )}
        </div>
      </aside>

      <main>
        <InputPanel />
      </main>
    </div>
  );
}
