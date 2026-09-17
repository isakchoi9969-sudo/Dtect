import os

import uvicorn

if __name__ == "__main__":
    # Node 서버가 000번을 쓰므로 겹치지 않게 6000번을 기본값으로 사용
    port = int(os.getenv("PORT", "6000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
