// src/config/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소 고정
});
