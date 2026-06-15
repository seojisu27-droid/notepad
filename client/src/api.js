// 노트 REST API 클라이언트
const BASE = '/api/notes';

async function handle(res) {
  if (!res.ok) {
    let message = `요청 실패 (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  list: () => fetch(BASE).then(handle),
  get: (id) => fetch(`${BASE}/${id}`).then(handle),
  create: (note) =>
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    }).then(handle),
  update: (id, note) =>
    fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    }).then(handle),
  remove: (id) =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handle),
};
