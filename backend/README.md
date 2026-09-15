1. 패키지 설치 내역 (Package Installation)
   📌 백엔드 (Backend) 패키지 설치
   백엔드 서버 구동 및 데이터베이스 연동, 환경 변수 관리를 위해 필요한 패키지를 설치했습니다.

명령어:

Bash
npm install express cors dotenv mysql2
npm install -D nodemon
설치 항목 설명:

express: Node.js 웹 프레임워크 (서버 구축 및 라우팅)

cors: 프론트엔드(localhost:5173)와 백엔드 간의 교차 출처 자원 공유 허용

dotenv: 환경 변수(.env) 안전한 관리

mysql2: MySQL 데이터베이스 연동 라이브러리

nodemon: 개발 중 코드 수정 시 서버를 자동으로 재시작해주는 도구 (DevDependency)

📌 프론트엔드 (Frontend) 패키지 설치
백엔드 API와의 통신을 위해 axios를 설치했습니다.

명령어:

Bash
npm install axios
설치 항목 설명:

axios: HTTP 클라이언트 (프론트에서 백엔드로 데이터를 주고받을 때 사용)

2. 프론트엔드(React) 주요 변경 및 추가 사항
   src/config/api.js 파일 추가

프론트엔드에서 백엔드 API 서버 주소(http://localhost:5000)를 일괄 관리하기 위한 설정 파일을 생성했습니다.

3. 백엔드(Node.js) 주요 추가 사항
   src/server.js 파일 추가

Express 서버의 기본 뼈대를 구축했습니다.

cors 미들웨어를 설정하여 프론트엔드(http://localhost:5173)의 요청을 허용하도록 구성했습니다.

향후 로그인, 회원가입 및 MySQL 데이터베이스 연동 로직을 처리할 API 엔드포인트의 기반을 마련했습니
