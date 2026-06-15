import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from './api.js';

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(''); // '', '저장 중…', '저장됨'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const saveTimer = useRef(null);

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.list();
      setNotes(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // 최초 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await loadNotes();
      if (data.length > 0) {
        await selectNote(data[0].id);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectNote(id) {
    try {
      const note = await api.get(id);
      setSelectedId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setStatus('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNew() {
    try {
      const note = await api.create({ title: '', content: '' });
      await loadNotes();
      setSelectedId(note.id);
      setTitle('');
      setContent('');
      setStatus('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (selectedId == null) return;
    if (!confirm('이 노트를 삭제할까요?')) return;
    try {
      await api.remove(selectedId);
      const data = await loadNotes();
      if (data.length > 0) {
        await selectNote(data[0].id);
      } else {
        setSelectedId(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // 디바운스 자동 저장
  const scheduleSave = useCallback(
    (nextTitle, nextContent) => {
      if (selectedId == null) return;
      setStatus('저장 중…');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const updated = await api.update(selectedId, {
            title: nextTitle,
            content: nextContent,
          });
          setStatus('저장됨');
          setNotes((prev) =>
            prev
              .map((n) =>
                n.id === updated.id
                  ? {
                      ...n,
                      title: updated.title,
                      preview: updated.content.slice(0, 200),
                      updated_at: updated.updated_at,
                    }
                  : n
              )
              .sort(
                (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
              )
          );
        } catch (err) {
          setError(err.message);
          setStatus('');
        }
      }, 600);
    },
    [selectedId]
  );

  function onTitleChange(e) {
    const v = e.target.value;
    setTitle(v);
    scheduleSave(v, content);
  }

  function onContentChange(e) {
    const v = e.target.value;
    setContent(v);
    scheduleSave(title, v);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__header">
          <h1 className="logo">📒 나의 메모장</h1>
          <button className="btn btn--primary" onClick={handleNew}>
            + 새 노트
          </button>
        </div>

        <div className="notelist">
          {loading && <p className="muted">불러오는 중…</p>}
          {!loading && notes.length === 0 && (
            <p className="muted">노트가 없습니다. 새 노트를 만들어 보세요.</p>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              className={
                'notelist__item' +
                (n.id === selectedId ? ' notelist__item--active' : '')
              }
              onClick={() => selectNote(n.id)}
            >
              <span className="notelist__title">
                {n.title?.trim() || '제목 없음'}
              </span>
              <span className="notelist__preview">
                {n.preview?.trim() || '내용 없음'}
              </span>
              <span className="notelist__date">{formatDate(n.updated_at)}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="editor">
        {selectedId == null ? (
          <div className="editor__empty">
            <p>왼쪽에서 노트를 선택하거나 새 노트를 만드세요.</p>
          </div>
        ) : (
          <>
            <div className="editor__toolbar">
              <span className="status">{status}</span>
              <button className="btn btn--danger" onClick={handleDelete}>
                삭제
              </button>
            </div>
            <input
              className="editor__title"
              placeholder="제목"
              value={title}
              onChange={onTitleChange}
            />
            <textarea
              className="editor__content"
              placeholder="여기에 메모를 작성하세요…"
              value={content}
              onChange={onContentChange}
            />
          </>
        )}
      </main>

      {error && (
        <div className="toast" onClick={() => setError('')}>
          ⚠ {error} (눌러서 닫기)
        </div>
      )}
    </div>
  );
}
