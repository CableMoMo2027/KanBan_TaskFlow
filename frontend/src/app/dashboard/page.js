'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, del } from '@/lib/api';
import { archiveBoard, getArchivedBoardIds } from '@/lib/boardArchive';
import { getStoredBoards, setStoredBoards, upsertStoredBoard, removeStoredBoard } from '@/lib/boardStorage';
import { navigateWithTransition } from '@/lib/navigation';
import Sidebar from '@/components/Sidebar';
import CreateBoardModal from '@/components/CreateBoardModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

const BOARD_COLORS = ['#5b5ef4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
const BOARD_ICONS = ['📌', '🚀', '⚡', '🎯', '🔥', '💡', '🌟', '🛠'];

// Stable color derived from board ID (not index)
function hashBoard(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = (h << 5) - h + id.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [boards, setBoards] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [archivedBoardIds, setArchivedBoardIds] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) navigateWithTransition(router, '/login', { replace: true });
  }, [user, authLoading, router]);

  const loadBoards = useCallback(async (targetUserId = userId) => {
    if (!targetUserId) return;

    try {
      const data = await get('/boards');
      setBoards(data);
      setStoredBoards(targetUserId, data);
    } catch (err) {
      console.error(err);
      const cachedBoards = getStoredBoards(targetUserId);
      if (cachedBoards.length > 0) {
        setBoards(cachedBoards);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const cachedBoards = getStoredBoards(userId);
      if (cachedBoards.length > 0) {
        setBoards(cachedBoards);
        setLoading(false);
      }
      setArchivedBoardIds(getArchivedBoardIds(userId));
      loadBoards(userId);
      loadMyTasks();
    }
  }, [userId, loadBoards]);

  // Listen for invitation acceptance → reload boards instantly
  useEffect(() => {
    function onBoardAccepted() {
      if (userId) loadBoards(userId);
    }
    window.addEventListener('board:accepted', onBoardAccepted);
    return () => window.removeEventListener('board:accepted', onBoardAccepted);
  }, [userId, loadBoards]);

  useEffect(() => {
    function handleArchiveChanged() {
      if (!userId) return;
      setArchivedBoardIds(getArchivedBoardIds(userId));
    }
    window.addEventListener('boards:archive-changed', handleArchiveChanged);
    return () => window.removeEventListener('boards:archive-changed', handleArchiveChanged);
  }, [userId]);

  async function loadMyTasks() {
    try {
      const data = await get('/tasks/my-tasks');
      setMyTasks(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    try {
      await del(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      if (user?.id) removeStoredBoard(user.id, id);
    } catch (err) { console.error(err); }
  };

  const handleArchive = (id, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!user) return;
    archiveBoard(user.id, id);
    setArchivedBoardIds(getArchivedBoardIds(user.id));
  };

  // Filter boards by search
  const filteredBoards = useMemo(() =>
    boards.filter((b) => !archivedBoardIds.includes(b.id) && b.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [boards, searchQuery, archivedBoardIds]
  );

  const visibleMyTasks = useMemo(
    () => myTasks.filter((task) => !archivedBoardIds.includes(task.board_id)),
    [myTasks, archivedBoardIds]
  );

  // Split owned vs collaborated
  const ownedBoards = filteredBoards.filter((b) => b.owner_id === user?.id);
  const collabBoards = filteredBoards.filter((b) => b.owner_id !== user?.id);

  if (authLoading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
    </div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)', fontSize: 13,
              outline: 'none', width: 240,
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <NotificationDropdown />
            <Link href="/profile" style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none',
            }}>{user.name?.charAt(0).toUpperCase()}</Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Project Workspace</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Manage your team&apos;s execution from a single precision interface.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCreateModal(true)} style={{
                padding: '9px 18px', borderRadius: 9, border: 'none',
                background: 'var(--accent)', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px var(--accent-glow)',
              }}>+ New Board</button>
            </div>
          </div>

          {/* My Tasks Banner */}
          {visibleMyTasks.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>My Tasks</h2>
                <Link href="/my-tasks" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {visibleMyTasks.slice(0, 5).map((task) => (
                  <Link key={task.id} href={`/board/${task.board_id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--bg-card)', borderRadius: 10, padding: '10px 14px',
                      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                      maxWidth: 220, transition: 'all 0.15s',
                    }}
                      onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.board_name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My Boards */}
          {!loading && (
            <>
              {/* Recent / Owned */}
              <div style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                    {searchQuery ? `Results for "${searchQuery}"` : 'My Boards'}
                    <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <button style={{
                    padding: '7px 14px', borderRadius: 7, border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 12,
                    fontWeight: 500, cursor: 'pointer',
                  }}>≡ Sort: Recent</button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 16,
                }}>
                  {/* Create New */}
                  <button onClick={() => setShowCreateModal(true)} style={{
                    border: '2px dashed var(--border)', borderRadius: 14,
                    background: 'var(--bg-card)', cursor: 'pointer', minHeight: 145,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-muted)' }}>+</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>+ Create New Board</span>
                  </button>

                  {/* Board Cards */}
                  {filteredBoards.map((board, i) => (
                    <BoardCard
                      key={board.id} board={board} index={i}
                      isOwner={board.owner_id === user?.id}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                    />
                  ))}
                </div>

                {searchQuery && filteredBoards.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
                    No boards match &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>

            </>
          )}

          {/* Workspace Activity */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Workspace Activity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { label: 'MY BOARDS', value: ownedBoards.length, color: 'var(--accent)' },
                { label: 'COLLABORATING', value: collabBoards.length, color: 'var(--success)' },
                { label: 'ASSIGNED TASKS', value: visibleMyTasks.length, color: 'var(--warning)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'var(--bg-card)', borderRadius: 12, padding: '18px 20px',
                  border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(board) => {
          const nextBoard = { ...board, role: 'owner' };
          setBoards((prev) => {
            const nextBoards = [nextBoard, ...prev.filter((item) => item.id !== nextBoard.id)];
            if (user?.id) {
              upsertStoredBoard(user.id, nextBoard);
            }
            return nextBoards;
          });
        }}
      />
    </div>
  );
}

// Inline BoardCard component
function BoardCard({ board, isOwner, onDelete, onArchive }) {
  const h = hashBoard(board.id);
  const color = board.color || BOARD_COLORS[h % BOARD_COLORS.length];
  const icon = BOARD_ICONS[h % BOARD_ICONS.length];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <Link href={`/board/${board.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
        overflow: 'hidden', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)',
      }}
        onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ height: 5, background: color }} />
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `${color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>{icon}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {!isOwner && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: 'var(--success-bg)', color: 'var(--success)',
                  textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>Collaborate</span>
              )}

              {/* ⋮ dropdown — shown for all */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((o) => !o); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    fontSize: 18, cursor: 'pointer', padding: '2px 6px', borderRadius: 5,
                    transition: 'all 0.15s', lineHeight: 1,
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >⋮</button>

                {menuOpen && (
                  <div className="animate-fade-in" style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: 'var(--dropdown-bg)', border: '1px solid var(--border)',
                    borderRadius: 10, boxShadow: 'var(--shadow-md)',
                    minWidth: 150, zIndex: 50, overflow: 'hidden',
                  }}>
                    {/* Archive — any role */}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onArchive?.(board.id, e); }} style={{
                      width: '100%', padding: '10px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'background 0.1s',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >🗄 Archive</button>

                    {/* Delete — owner only */}
                    {isOwner && (
                      <>
                        <div style={{ height: 1, background: 'var(--border)' }} />
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onDelete?.(board.id, e); }} style={{
                          width: '100%', padding: '10px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600, color: 'var(--danger)',
                          textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                          transition: 'background 0.1s',
                        }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--danger-bg)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >🗑 Delete Board</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{board.name}</h3>
          {board.description && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {board.description}
            </p>
          )}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            Updated {board.updated_at ? new Date(board.updated_at).toLocaleDateString() : 'recently'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color }}>Open Board →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

