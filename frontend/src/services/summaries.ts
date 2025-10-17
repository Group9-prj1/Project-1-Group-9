export type SummaryView = {
  id: number | string;
  original_text: string;         
  created_at: string;   
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
const SUMMARIES_URL = `${API_BASE}/summaries`;

export async function getSummaries(skip = 0, limit = 20, token?: string) {
  const res = await fetch(`${SUMMARIES_URL}?skip=${skip}&limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include", 
  });
  if (!res.ok) {
    throw new Error(`Fetch summaries failed: ${res.status}`);
  }
  const data: SummaryView[] = await res.json();
  return data;
}
