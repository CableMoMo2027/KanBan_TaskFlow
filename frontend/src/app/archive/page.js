'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { get } from '@/lib/api';
import { getArchivedBoardIds, unarchiveBoard } from '@/lib/boardArchive';
import { navigateWithTransition } from '@/lib/navigation';
import Sidebar from '@/components/Sidebar';
import NotificationDropdown from '@/components/NotificationDropdown';

const BOARD_COLORS = ['#5b5ef4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

function hashBoard(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = (h << 5) - h + id.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export default function ArchivePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState([]);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!authLoading && !user) navigateWithTransition(router, '/login', { replace: true });
  }, [user, authLoading, router]);

  const archivedIds = useMemo(() => {
    void archiveVersion;
    return userId ? getArchivedBoardIds(userId) : [];
  }, [userId, archiveVersion]);

  const loadBoards = useCallback(() => {
    if (!userId) return;
    get('/boards')
      .then((data) => setBoards(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    function handleArchiveChanged() {
      if (!userId) return;
      setArchiveVersion((v) => v + 1);
    }
    window.addEventListener('boards:archive-changed', handleArchiveChanged);
    return () => window.removeEventListener('boards:archive-changed', handleArchiveChanged);
  }, [userId]);

  const archivedBoards = useMemo(
    () => boards.filter((board) => archivedIds.includes(board.id)),
    [boards, archivedIds]
  );

  const handleUnarchive = (boardId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    unarchiveBoard(userId, boardId);
    setArchiveVersion((v) => v + 1);
  };

  if (authLoading || !user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Archive</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Boards you archived will stay here until restored.</div>
          </div>
          <NotificationDropdown />
        </div>

        <div style={{ padding: '32px' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : archivedBoards.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border)',
              borderRadius: 16,
              padding: '52px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🗄</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No archived boards</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Archived boards will appear here and stay hidden from the main dashboard.
              </div>
              <Link href="/dashboard" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
                Back to dashboard
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {archivedBoards.map((board) => {
                const color = BOARD_COLORS[hashBoard(board.id) % BOARD_COLORS.length];
                return (
                  <Link key={board.id} href={`/board/${board.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--bg-card)',
                      borderRadius: 16,
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div style={{ height: 6, background: color }} />
                      <div style={{ padding: '16px 16px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{board.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Updated {board.updated_at ? new Date(board.updated_at).toLocaleDateString() : 'recently'}
                            </div>
                          </div>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: 'rgba(91, 94, 244, 0.08)',
                            color: 'var(--accent)',
                            fontSize: 10,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}>
                            Archived
                          </span>
                        </div>

                        {board.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                            {board.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>Open Board →</span>
                          <button
                            onClick={(e) => handleUnarchive(board.id, e)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 10,
                              border: '1px solid rgba(16, 185, 129, 0.22)',
                              background: 'rgba(16, 185, 129, 0.08)',
                              color: 'var(--success)',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

