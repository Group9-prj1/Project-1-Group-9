import { useState } from "react";
import { PanelLeftOpen, X } from "lucide-react";
import Header from "../components/home/Header";
import InputPanel from "../components/home/InputPanel";
import HistoryPanel, { HistoryItem } from "../components/home/HistoryPanel";
import "../styles/HomePage.css";

const mockHistory: HistoryItem[] = [
  { id: 1, title: "Test1", time: "Hôm nay" },
  { id: 2, title: "Test2", time: "Hôm qua" },
  { id: 3, title: "Test3", time: "14/10" },
];

export default function HomePage() {
  const [openHistory, setOpenHistory] = useState(false);
  const [items] = useState<HistoryItem[]>(mockHistory);

  return (
    <div className="min-h-screen">
      <Header />

      <button
        onClick={() => setOpenHistory(true)}
        className="btn-history"
        aria-label="Mở lịch sử"
      >
        <PanelLeftOpen className="h-4 w-4" />
        <span>Lịch sử</span>
      </button>

      <aside
        className={`drawer drawer--sm ${openHistory ? "drawer--open" : "drawer--closed"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          <button
            onClick={() => setOpenHistory(false)}
            className="icon-btn"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="drawer-body">
          <HistoryPanel
            items={items}
            className="w-full p-0 bg-transparent shadow-none"
          />
        </div>
      </aside>
      <main >
        <InputPanel />
      </main>
    </div>
  );
}