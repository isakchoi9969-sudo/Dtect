// src/config/api.js
import axios from "axios";

// 현재 접속한 호스트를 기준으로 백엔드 주소를 자동 설정한다.
// localhost로 접속하면 localhost:3000,
// IP로 접속하면 해당 IP:3000으로 연결한다.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `http://${window.location.hostname}:3000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
