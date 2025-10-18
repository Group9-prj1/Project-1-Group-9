
export type SummaryView = {
  id: string;
  original_text: string | null;  
  summary_text: string;
  created_at: string;          
};

const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/+$/,"");
const SUMMARIES_URL = `${API_BASE}/summaries`;


function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseOrThrow(res: Response) {
  let payload: any = null;
  try { payload = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return payload;
}

export async function getSummaries(skip = 0, limit = 20, token?: string) {
  const res = await fetch(`${SUMMARIES_URL}?skip=${skip}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
  });
  return parseOrThrow(res) as Promise<SummaryView[]>;
}

export async function getSummaryById(id: string, token?: string): Promise<SummaryView> {
  const res = await fetch(`${SUMMARIES_URL}/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      ...authHeaders(token),
    },
    credentials: "include",
  });
  return parseOrThrow(res) as Promise<SummaryView>;
}
