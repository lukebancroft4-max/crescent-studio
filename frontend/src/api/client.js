const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

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
  return `${API_BASE}/export/audio/${beatId}`;
}

export function getMidiUrl(beatId) {
  return `${API_BASE}/export/midi/${beatId}`;
}

export async function separateStems(beatId) {
  const res = await fetch(`${API_BASE}/separate/${beatId}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Stem separation failed" }));
    throw new Error(err.detail || "Stem separation failed");
  }
  return res.json();
}

export async function fetchStems(beatId) {
  const res = await fetch(`${API_BASE}/stems/${beatId}`);
  if (!res.ok) return null;
  return res.json();
}

export function getStemUrl(beatId, stemName) {
  return `${API_BASE}/stems/${beatId}/${stemName}`;
}

export function getStemsZipUrl(beatId) {
  return `${API_BASE}/stems-zip/${beatId}`;
}

export async function createPlan(params) {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Plan generation failed" }));
    throw new Error(err.detail || "Plan generation failed");
  }
  return res.json();
}

export async function generateFromPlan(compositionPlan, seed = null) {
  const res = await fetch(`${API_BASE}/generate-from-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ composition_plan: compositionPlan, seed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Generation from plan failed" }));
    throw new Error(err.detail || "Generation from plan failed");
  }
  return res.json();
}

export async function generateSfx(params) {
  const res = await fetch(`${API_BASE}/sfx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "SFX generation failed" }));
    throw new Error(err.detail || "SFX generation failed");
  }
  return res.json();
}
