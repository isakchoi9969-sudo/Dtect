"""Express 의 `app.listen(PORT, ...)` 대응.

Node 는 서버 실행 코드가 server.js 안에 있었지만,
FastAPI 는 보통 "앱 정의(app/main.py)"와 "실행(run.py)"을 분리한다.
이렇게 하면 나중에 `uvicorn app.main:app` 커맨드로 직접 실행하거나
Docker/gunicorn 으로 띄울 때도 코드를 안 건드려도 된다.
"""
import os

import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))  # 기존 Node 서버와 동일하게 기본 5000
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
    # reload=True: 코드 저장 시 자동 재시작 → Express 의 nodemon 역할을 uvicorn이 내장
