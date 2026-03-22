'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get } from '@/lib/api';
import { navigateWithTransition } from '@/lib/navigation';
import Sidebar from '@/components/Sidebar';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

const TAG_PALETTE = {
  blue: { bg: '#dbeafe', text: '#1d4ed8' },
  green: { bg: '#d1fae5', text: '#065f46' },
  yellow: { bg: '#fef3c7', text: '#92400e' },
  red: { bg: '#fee2e2', text: '#991b1b' },
  purple: { bg: '#ede9fe', text: '#5b21b6' },
};
const P_KEYS = Object.keys(TAG_PALETTE);

const BOARD_COLORS = ['#5b5ef4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
function hashBoard(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = (h << 5) - h + id.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export default function MyTasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks'); // tasks | boards

  useEffect(() => {
    if (!authLoading && !user) navigateWithTransition(router, '/login', { replace: true });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  async function loadAll() {
    try {
      const [taskData, boardData] = await Promise.all([
        get('/tasks/my-tasks'),
        get('/boards'),
      ]);
      setTasks(taskData);
      setBoards(boardData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const myBoards = boards.filter((b) => b.owner_id === user?.id);

  // Group tasks by board
  const boardGroups = tasks.reduce((acc, task) => {
    const key = task.board_id;
    if (!acc[key]) acc[key] = { name: task.board_name, id: task.board_id, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  if (authLoading || !user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 28px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 9, padding: 4 }}>
            {[
              { key: 'tasks', label: `Assigned Tasks ${tasks.length > 0 ? `(${tasks.length})` : ''}` },
              { key: 'boards', label: `My Boards ${myBoards.length > 0 ? `(${myBoards.length})` : ''}` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '6px 16px', borderRadius: 7, border: 'none',
                background: tab === key ? 'var(--bg-card)' : 'transparent',
                color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: tab === key ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>My Tasks</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
              {tab === 'tasks'
                ? 'Tasks assigned to you across all boards'
                : 'Boards you created and own'}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
          ) : tab === 'boards' ? (
            /* ── My Boards tab ── */
            myBoards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 14, border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No boards created yet</h3>
                <Link href="/dashboard" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  ← Go create your first board
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myBoards.map((board) => {
                  const h = hashBoard(board.id);
                  const color = BOARD_COLORS[h % BOARD_COLORS.length];
                  return (
                    <Link key={board.id} href={`/board/${board.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'var(--bg-card)', borderRadius: 12, padding: '14px 18px',
                        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'all 0.15s',
                      }}
                        onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = color; }}
                        onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        {/* Color dot */}
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: color, flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{board.name}</p>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Updated {board.updated_at ? new Date(board.updated_at).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: 'var(--accent-bg)', color: 'var(--accent)',
                          textTransform: 'uppercase',
                        }}>Owner</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color }}>Open →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            /* ── Assigned Tasks tab ── */
            tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 14, border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No tasks assigned yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  When someone assigns you a task on a board, it&apos;ll appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} showBoard />)}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

function TaskRow({ task, showBoard }) {
  const tags = task.tags || [];
  return (
    <Link href={`/board/${task.board_id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 10, padding: '14px 18px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s',
      }}
        onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent-light)'; }}
        onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 5, border: '2px solid var(--border)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
          {showBoard && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.board_name} · {task.column_name}</span>}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {tags.slice(0, 2).map((tag, i) => {
            const p = TAG_PALETTE[P_KEYS[i % P_KEYS.length]];
            return <span key={tag} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: p.bg, color: p.text, textTransform: 'uppercase' }}>{tag}</span>;
          })}
        </div>
      </div>
    </Link>
  );
}

