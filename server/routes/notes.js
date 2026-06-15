import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const NOW = "strftime('%Y-%m-%dT%H:%M:%SZ','now')";

// 목록 조회 (최근 수정순). 본문은 미리보기용으로 짧게 잘라서 반환.
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, title,
              substr(content, 1, 200) AS preview,
              created_at, updated_at
         FROM notes
        ORDER BY updated_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 단건 조회
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM notes WHERE id = ?', [
      Number(req.params.id),
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 생성
router.post('/', async (req, res, next) => {
  try {
    const title = (req.body?.title ?? '').toString();
    const content = (req.body?.content ?? '').toString();
    const { rows } = await query(
      `INSERT INTO notes (title, content)
       VALUES (?, ?)
       RETURNING *`,
      [title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 수정
router.put('/:id', async (req, res, next) => {
  try {
    const title = (req.body?.title ?? '').toString();
    const content = (req.body?.content ?? '').toString();
    const { rows } = await query(
      `UPDATE notes
          SET title = ?,
              content = ?,
              updated_at = ${NOW}
        WHERE id = ?
      RETURNING *`,
      [title, content, Number(req.params.id)]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 삭제
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM notes WHERE id = ?', [
      Number(req.params.id),
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
