// src/config/api.js
import axios from "axios";

// Node API 서버 주소를 한 곳에서 관리한다.
// AI 서버(6000)가 아니라 프런트가 호출하는 백엔드 API 서버(기본 3000)로 연결한다.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  withCredentials: true,
});
