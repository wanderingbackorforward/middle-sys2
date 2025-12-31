export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
console.info('[env] VITE_API_BASE_URL=', API_BASE);
export const apiUrl = (p: string) => `${API_BASE}${p}`;
