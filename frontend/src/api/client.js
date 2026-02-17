const API_BASE = "/api";

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error("Failed to fetch presets");
  return res.json();
}

export async function generateBeat(params) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(err.detail || "Generation failed");
  }
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function getAudioUrl(beatId) {
  return `${API_BASE}/export/wav/${beatId}`;
}

export function getMidiUrl(beatId) {
  return `${API_BASE}/export/midi/${beatId}`;
}
