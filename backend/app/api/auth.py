"""인증 관련 라우터: /api/auth/signup, /api/auth/login.

[Node/Express server.js 와 줄 단위 대응표]

  Express                                    FastAPI
  ─────────────────────────────────────────  ─────────────────────────────────
  app.post("/api/auth/login", (req, res)=>{  @router.post("/login")
                                              def login(payload: LoginRequest):
  const {email,password} = req.body            # payload.email / payload.password
                                                 (타입 검증까지 이미 끝난 상태)
  res.json({...})                             return {...}   # dict 리턴이 곧 JSON 응답
  res.status(400).json({...})                 raise HTTPException(400, detail=...)
  res.status(401).json({...})                 raise HTTPException(401, detail=...)

Express 는 `res` 객체를 직접 조작해서 상태코드+본문을 만들지만,
FastAPI 는 "정상 흐름은 return, 에러는 raise" 로 나뉜다.
"""
import logging

from fastapi import APIRouter, HTTPException

from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserOut

logger = logging.getLogger(__name__)

# prefix 를 여기서 지정하면 main.py 에서는 경로를 반복해서 안 적어도 된다.
router = APIRouter(prefix="/api/auth", tags=["auth"])

# ⚠️ server.js 와 동일하게 "메모리 임시 저장 + 하드코딩 관리자 계정" 을 그대로 옮겼다.
# 서버를 재시작하면 가입한 회원 정보는 사라진다. DB 연동 전 임시 구현이다.
# (원본 Node 코드도 실제로는 저장하지 않고 콘솔에만 찍고 성공 응답만 보냈다)
_fake_users_db: dict[str, dict] = {}

ADMIN_EMAIL = "admin@company.com"
ADMIN_PASSWORD = "12345678"


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    """회원가입 처리 (임시 구현, DB 미연동).

    Express 버전과 동일한 로직:
      1) 비밀번호 확인 일치 검사
      2) (실제 저장은 하지 않고) 성공 메시지만 반환
    Pydantic 이 이미 email 형식, 비밀번호 8자 이상은 걸러줬으므로
    여기서는 "두 비밀번호가 같은가"만 추가로 확인하면 된다.
    """
    logger.info("받은 회원가입 데이터: %s", {"name": payload.name, "email": payload.email})

    # Express: if (password !== passwordConfirm) return res.status(400).json(...)
    if payload.password != payload.passwordConfirm:
        raise HTTPException(
            status_code=400,
            detail="비밀번호가 일치하지 않습니다.",
        )

    # TODO: DB 연동 시 여기서 비밀번호 해싱(bcrypt/passlib) 후 저장.
    # 지금은 원본 Node 코드와 동일하게 메모리에만 남기고 응답한다.
    _fake_users_db[payload.email] = {"name": payload.name, "password": payload.password}

    return AuthResponse(success=True, message="회원가입이 성공적으로 완료되었습니다!")


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    """로그인 처리 (임시 관리자 계정: admin@company.com / 12345678).

    Express 버전의 if/else 분기를 그대로 옮겼다.
    실패 시 res.status(401).json(...) → raise HTTPException(401, ...) 로 대응.
    """
    logger.info("받은 로그인 데이터: %s", {"email": payload.email})

    if payload.email == ADMIN_EMAIL and payload.password == ADMIN_PASSWORD:
        return AuthResponse(
            success=True,
            message="로그인 성공!",
            user=UserOut(email=ADMIN_EMAIL, name="관리자"),
        )

    # 회원가입으로 저장된 임시 유저도 확인 (원본 Node 코드에는 없었지만
    # signup 이후 login 이 아예 안 되는 건 부자연스러워서 최소한으로 추가함)
    user = _fake_users_db.get(payload.email)
    if user and user["password"] == payload.password:
        return AuthResponse(
            success=True,
            message="로그인 성공!",
            user=UserOut(email=payload.email, name=user["name"]),
        )

    raise HTTPException(
        status_code=401,
        detail="등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
    )
