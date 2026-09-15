"""회원가입/로그인 요청·응답 스키마.

[Node/Express 와 비교]
Express 에서는 `req.body` 가 그냥 평범한 JS 객체라서 무엇이 들어올지
런타임에 가서야 알 수 있었다 (server.js 의 `const { name, email, ... } = req.body`).

FastAPI 에서는 Pydantic 모델로 "이 요청은 반드시 이런 필드/타입을 가진다"를
먼저 선언한다. 그러면:
  - email 형식이 아니면 자동으로 422 에러 (Express 에서는 직접 정규식 검사 필요했음)
  - password 가 없으면 자동으로 422 에러 (Express 에서는 undefined 로 들어와 조용히 통과했음)
즉 Express 의 "일단 받고 함수 안에서 검증"이
FastAPI 에서는 "선언 단계에서 자동 검증"으로 바뀐다.
"""
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """POST /api/auth/signup 요청 본문.

    프론트(AuthPage.jsx)의 FormData 필드명(name, email, password, passwordConfirm)과
    1:1로 맞춰야 axios.post(data) 가 그대로 바인딩된다.
    """
    name: str = Field(..., min_length=1, description="사용자 이름")
    email: EmailStr = Field(..., description="이메일 (형식 자동 검증)")
    password: str = Field(..., min_length=8, description="8자 이상")
    passwordConfirm: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    """POST /api/auth/login 요청 본문."""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """로그인 성공 시 내려주는 사용자 정보 (비밀번호 등 민감정보 제외)."""
    email: str
    name: str


class AuthResponse(BaseModel):
    """signup/login 공통 응답 형태.

    Express 의 `res.json({ success, message, user? })` 와 동일한 모양을 유지해서
    프론트 코드(AuthPage.jsx 의 response.data.message 등)를 수정하지 않아도 되게 했다.
    """
    success: bool
    message: str
    user: UserOut | None = None
