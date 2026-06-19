# 과제 알리미 (Assignment Notifier)

과제의 내용과 기한을 입력하면, 기한이 가까운 것부터 위로 정렬해 보여주고
마감이 임박한 항목을 알림으로 띄워주는 웹 앱입니다.
React + Vite로 만들었고, 데이터는 브라우저(localStorage)에 저장되어
새로고침하거나 껐다 켜도 유지됩니다. 별도 서버가 필요 없습니다.

## 기능

- 과제 추가: 제목 / 과목 / 기한 / 메모
- D-day 자동 계산과 색상 표시 (임박=주황, 지남=빨강, 여유=파랑)
- 마감 임박(D-2 이내) 항목 상단 알림 배너
- 완료 체크 / 삭제
- 진행 중 · 완료 · 전체 필터
- 데이터 자동 저장

## 로컬에서 실행하는 방법

Node.js(18 이상)가 설치돼 있어야 합니다. https://nodejs.org 에서 LTS 설치.

```bash
# 1) 압축을 푼 폴더로 이동
cd assignment-notifier

# 2) 필요한 패키지 설치
npm install

# 3) 개발 서버 실행
npm run dev
```

실행하면 터미널에 `http://localhost:5173` 같은 주소가 뜹니다.
브라우저에서 그 주소를 열면 앱이 보입니다.

## 인터넷에 배포하는 방법 (실제 접속 가능한 URL 만들기)

가장 쉬운 방법은 Vercel입니다. 무료이고 클릭 몇 번이면 됩니다.

방법 A — 웹에서 바로 (추천, 코드 몰라도 됨)
1. https://github.com 에 가입 후, 이 폴더를 새 저장소(repository)에 업로드한다.
   (GitHub 웹페이지의 "Add file > Upload files"로 폴더 내용을 끌어다 놓으면 됩니다.)
2. https://vercel.com 에 GitHub 계정으로 로그인한다.
3. "Add New > Project"를 누르고 방금 만든 저장소를 선택한다.
4. 설정은 건드릴 것 없이 그대로 "Deploy"를 누른다.
   (Vercel이 Vite 프로젝트임을 자동으로 인식합니다.)
5. 잠시 뒤 `https://assignment-notifier-xxxx.vercel.app` 형태의
   실제 주소가 나옵니다. 이 주소를 PDF에 적으면 됩니다.

방법 B — 빌드 결과만 올리기 (Netlify Drop)
1. `npm run build` 를 실행하면 `dist` 폴더가 생긴다.
2. https://app.netlify.com/drop 에 `dist` 폴더를 그대로 끌어다 놓는다.
3. 바로 접속 가능한 주소가 발급된다.

## 폴더 구조

```
assignment-notifier/
├─ index.html        진입 HTML
├─ package.json      프로젝트 정보 / 실행 명령
├─ vite.config.js    빌드 설정
└─ src/
   ├─ main.jsx       React 시작점
   └─ App.jsx        앱 본체 (모든 기능이 여기 있음)
```
