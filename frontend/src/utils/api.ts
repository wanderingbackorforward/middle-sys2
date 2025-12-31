export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
export const apiUrl = (p: string) => `${API_BASE}${p}`;
