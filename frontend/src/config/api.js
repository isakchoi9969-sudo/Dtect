// src/config/api.js
import axios from "axios";

// 환경변수를 우선 사용한다. 개발 서버는 로컬 Express로 연결하고,
// 운영 빌드는 현재 HTTPS 도메인의 Nginx /api 프록시를 사용한다.
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl || (
  import.meta.env.DEV ? "http://localhost:3000" : "/"
);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
