import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { initDb } from './db.js';
import notesRouter from './routes/notes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json({ limit: '1mb' }));

// API 라우트
app.use('/api/notes', notesRouter);

// 헬스체크
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 프로덕션: React 빌드 결과물(client/dist) 정적 제공 + SPA 폴백
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 공통 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
    });
  })
  .catch((err) => {
    console.error('[server] DB 초기화 실패, 종료합니다.', err);
    process.exit(1);
  });
