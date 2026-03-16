import type { RecentRecordsResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export const fetchRecentRecords = async (): Promise<RecentRecordsResponse> => {
  const response = await fetch(`${API_BASE}/data/recent?limit=100`);
  if (!response.ok) {
    throw new Error(`Failed to fetch records: ${response.status}`);
  }
  return response.json();
};

export const seedDemoData = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/demo/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force: true })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Failed to seed data: ${response.status}`);
  }
};

export const downloadSecureExport = async (type: "csv" | "pdf", token: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/export/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Export failed: ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `week17-export.${type}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};