# 📒 나의 메모장 (Notepad)

에버노트 스타일의 개인 메모장입니다. **Express + React(Vite) + Turso(libSQL)** 로 만들었고,
**Render Blueprint** 로 무료 플랜에 배포할 수 있습니다.

- 노트 작성 / 조회 / 수정 / 삭제 (CRUD)
- 좌측 목록 + 우측 에디터의 2단 레이아웃
- 입력 시 자동 저장(디바운스)
- API 서버가 React 빌드 결과물도 함께 서빙 → **무료 웹 서비스 1개로 동작**

## 폴더 구조

```
notepad/
├─ server/            # Express API 서버
│  ├─ index.js        # 진입점 (API + 정적파일 서빙)
│  ├─ db.js           # Turso(libSQL) 연결 & 테이블 초기화
│  └─ routes/notes.js # 노트 CRUD 라우트
├─ client/            # React (Vite) 프론트엔드
│  └─ src/            # App.jsx, api.js, styles.css ...
├─ render.yaml        # Render Blueprint (모두 free 플랜)
├─ .env.example       # 환경변수 예시
└─ package.json       # 서버 의존성 & 스크립트
```

## 로컬 개발

1. 의존성 설치
   ```bash
   npm install
   npm --prefix client install
   ```
2. Turso DB 준비 후 `.env` 생성
   ```bash
   cp .env.example .env
   # .env 안의 TURSO_URL / TURSO_TOKEN 을 본인 Turso DB 값으로 채우세요.
   #   turso db show <db이름>            → TURSO_URL
   #   turso db tokens create <db이름>   → TURSO_TOKEN
   ```
3. 서버 + 프론트 동시 실행 (터미널 2개)
   ```bash
   npm run dev:server   # http://localhost:3001  (API)
   npm run dev:client   # http://localhost:5173  (화면, /api 는 자동 프록시)
   ```
   브라우저에서 http://localhost:5173 접속.

### 프로덕션처럼 한 서버로 실행
```bash
npm run build   # client/dist 생성
npm start       # http://localhost:3001 에서 화면+API 모두 제공
```

## Render 배포 (무료)

1. 이 저장소를 GitHub 에 푸시합니다.
2. Render 대시보드 → **New +** → **Blueprint** → 저장소 선택.
3. `render.yaml` 을 자동 인식합니다. 웹 서비스가 **free 플랜**으로 설정되어 있습니다:
   - `notepad` : 무료 Web Service (Node)
   - 데이터베이스는 외부 **Turso(libSQL)** 를 사용합니다.
4. 배포 시 Render 가 `TURSO_URL` / `TURSO_TOKEN` 값을 물어봅니다(보안상 `render.yaml`
   에 넣지 않고 `sync: false` 로 처리). 본인 Turso DB 값을 입력하면 됩니다.

> ⚠️ 무료 플랜 주의사항
> - DB 는 **Turso 무료 플랜**을 그대로 사용하므로 만료 걱정이 없습니다.
> - **무료 웹 서비스**는 15분간 요청이 없으면 잠들고, 다음 첫 요청 시 깨어나는 데
>   몇 초가 걸립니다(콜드 스타트).

## API 요약

| 메서드 | 경로              | 설명        |
| ------ | ----------------- | ----------- |
| GET    | `/api/notes`      | 목록 조회   |
| GET    | `/api/notes/:id`  | 단건 조회   |
| POST   | `/api/notes`      | 생성        |
| PUT    | `/api/notes/:id`  | 수정        |
| DELETE | `/api/notes/:id`  | 삭제        |
