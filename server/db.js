import { createClient } from '@libsql/client';

// Turso(libSQL) 연결. 로컬은 .env, Render 는 대시보드 환경변수에서 주입됩니다.
const url = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    '[db] TURSO_URL 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.'
  );
}

export const db = createClient({ url, authToken });

// pg 시절과 동일한 사용감을 위해 { rows, rowCount } 형태로 감싸서 반환합니다.
export async function query(sql, args = []) {
  const rs = await db.execute({ sql, args });
  return {
    rows: rs.rows.map((r) => ({ ...r })),
    rowCount: rs.rowsAffected,
  };
}

// 앱 시작 시 notes 테이블이 없으면 생성합니다. (SQLite/libSQL 문법)
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
  `);
  console.log('[db] notes 테이블 준비 완료 (Turso/libSQL)');
}
