'use client';

const STORAGE_PREFIX = 'taskflow-boards:';

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getStoredBoards(userId) {
  if (typeof window === 'undefined' || !userId) return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredBoards(userId, boards) {
  if (typeof window === 'undefined' || !userId) return;

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.isArray(boards) ? boards : []));
  } catch {}
}

export function upsertStoredBoard(userId, board) {
  if (!userId || !board?.id) return [];

  const current = getStoredBoards(userId);
  const next = [board, ...current.filter((item) => item.id !== board.id)];
  setStoredBoards(userId, next);
  return next;
}

export function removeStoredBoard(userId, boardId) {
  if (!userId || !boardId) return [];

  const next = getStoredBoards(userId).filter((board) => board.id !== boardId);
  setStoredBoards(userId, next);
  return next;
}
