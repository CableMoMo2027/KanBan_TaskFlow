'use client';

const STORAGE_PREFIX = 'archived-board-ids:';

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export function getArchivedBoardIds(userId) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArchivedBoardIds(userId, ids) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('boards:archive-changed'));
}

export function archiveBoard(userId, boardId) {
  const current = getArchivedBoardIds(userId);
  if (current.includes(boardId)) return current;
  const next = [...current, boardId];
  saveArchivedBoardIds(userId, next);
  return next;
}

export function unarchiveBoard(userId, boardId) {
  const next = getArchivedBoardIds(userId).filter((id) => id !== boardId);
  saveArchivedBoardIds(userId, next);
  return next;
}

export function isBoardArchived(userId, boardId) {
  return getArchivedBoardIds(userId).includes(boardId);
}
