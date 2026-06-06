// Centralizes runtime URLs. Override via Vite env vars in production.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export const WS_URL =
  import.meta.env.VITE_WS_URL ?? API_URL.replace(/^http/, 'ws')
