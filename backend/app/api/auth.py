"""D:TECT 회원 인증 API.

현재 상태
- 회원가입: 임시 메모리 저장
- 로그인: MySQL USER 테이블 조회
"""

import logging

import bcrypt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserOut,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)


# =========================================================
# 임시 회원가입 저장소
# 나중에 회원가입 DB 연동 시 삭제 예정
# =========================================================

_fake_users_db: dict[str, dict] = {}


# =========================================================
# 회원가입
# 아직 DB에 저장하지 않고 기존 임시 방식 유지
# =========================================================

@router.post(
    "/signup",
    response_model=AuthResponse
)
def signup(payload: SignupRequest):

    logger.info(
        "회원가입 요청: %s",
        {
            "name": payload.name,
            "email": payload.email
        }
    )

    # 비밀번호 확인
    if payload.password != payload.passwordConfirm:

        raise HTTPException(
            status_code=400,
            detail="비밀번호가 일치하지 않습니다.",
        )


    # 임시 저장
    _fake_users_db[payload.email] = {
        "name": payload.name,
        "password": payload.password,
    }


    return AuthResponse(
        success=True,
        message="회원가입이 성공적으로 완료되었습니다!"
    )


# =========================================================
# 로그인
# MySQL USER 테이블 실제 조회
# =========================================================

@router.post(
    "/login",
    response_model=AuthResponse
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    logger.info(
        "로그인 요청: %s",
        {
            "email": payload.email
        }
    )


    # -----------------------------------------------------
    # 1. MySQL USER 테이블에서 이메일 조회
    # -----------------------------------------------------

    query = text("""
        SELECT
            USER_ID,
            COMPANY_ID,
            LOGIN_ID,
            PASSWORD,
            NAME,
            EMAIL,
            USER_TYPE,
            CREATED_AT
        FROM `USER`
        WHERE EMAIL = :email
        LIMIT 1
    """)


    user = db.execute(
        query,
        {
            "email": payload.email
        }
    ).mappings().first()


    # -----------------------------------------------------
    # 2. DB에 사용자가 존재하는 경우
    # -----------------------------------------------------

    if user:

        try:

            password_ok = bcrypt.checkpw(
                payload.password.encode("utf-8"),
                user["PASSWORD"].encode("utf-8")
            )

        except Exception as e:

            logger.error(
                "비밀번호 검증 오류: %s",
                e
            )

            password_ok = False


        if not password_ok:

            raise HTTPException(
                status_code=401,
                detail="등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
            )


        return AuthResponse(
            success=True,
            message="로그인 성공!",
            user=UserOut(
                email=user["EMAIL"],
                name=user["NAME"],
            ),
        )


    # -----------------------------------------------------
    # 3. 임시 회원가입 사용자 확인
    #
    # 회원가입 DB 연동 전까지만 사용하는 코드
    # -----------------------------------------------------

    temp_user = _fake_users_db.get(
        payload.email
    )


    if (
        temp_user
        and
        temp_user["password"] == payload.password
    ):

        return AuthResponse(
            success=True,
            message="로그인 성공!",
            user=UserOut(
                email=payload.email,
                name=temp_user["name"],
            ),
        )


    # -----------------------------------------------------
    # 4. 사용자 없음
    # -----------------------------------------------------

    raise HTTPException(
        status_code=401,
        detail="등록되지 않은 이메일이거나 비밀번호가 틀렸습니다.",
    )