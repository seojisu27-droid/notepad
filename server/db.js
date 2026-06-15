import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    '[db] DATABASE_URL 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.'
  );
}

// Render 의 외부 PostgreSQL 연결은 SSL 을 요구합니다.
// 로컬(localhost) 연결에서는 SSL 을 끕니다.
const isLocal =
  !connectionString ||
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export async function query(text, params) {
  return pool.query(text, params);
}

// 앱 시작 시 notes 테이블이 없으면 생성합니다.
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('[db] notes 테이블 준비 완료');
}
