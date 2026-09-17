// src/config/api.js
import axios from "axios";

// FastAPI 백엔드(run.py 기본 포트 3000)와 주소를 여기서 한 곳만 관리한다.
// AuthPage.jsx 를 포함해 앞으로 추가될 모든 API 호출이 이 인스턴스를 통해야
// 나중에 포트나 도메인이 바뀔 때 이 파일 한 줄만 고치면 된다.
export const api = axios.create({
  baseURL: "http://localhost:3000", // 기존 8080 → FastAPI 백엔드 포트(3000)로 통일
});
