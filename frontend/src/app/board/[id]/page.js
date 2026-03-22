'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { get, patch } from '@/lib/api';
import { navigateWithTransition } from '@/lib/navigation';
import { DragDropContext } from '@hello-pangea/dnd';
import Sidebar from '@/components/Sidebar';
import ColumnCard from '@/components/ColumnCard';
import CreateColumnModal from '@/components/CreateColumnModal';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

function getColumnTone(name = '', index = 0, total = 0) {
  const raw = String(name).toLowerCase();
  if (raw.includes('done') || raw.includes('complete') || raw.includes('finish') || raw.includes('closed')) {
    return { status: 'Completed', accent: '#16a34a', badgeBg: '#dcfce7', badgeText: '#166534', border: '#86efac' };
  }
  if (raw.includes('review') || raw.includes('approve') || raw.includes('qa') || raw.includes('test')) {
    return { status: 'Review', accent: '#d97706', badgeBg: '#fef3c7', badgeText: '#92400e', border: '#fcd34d' };
  }
  if (raw.includes('progress') || raw.includes('doing') || raw.includes('active')) {
    return { status: 'In Progress', accent: '#2563eb', badgeBg: '#dbeafe', badgeText: '#1d4ed8', border: '#93c5fd' };
  }

  const stepTones = [
    { status: 'Backlog', accent: '#7c3aed', badgeBg: '#ede9fe', badgeText: '#5b21b6', border: '#c4b5fd' },
    { status: 'Ready', accent: '#2563eb', badgeBg: '#dbeafe', badgeText: '#1d4ed8', border: '#93c5fd' },
    { status: 'In Progress', accent: '#0891b2', badgeBg: '#cffafe', badgeText: '#155e75', border: '#67e8f9' },
    { status: 'Review', accent: '#d97706', badgeBg: '#fef3c7', badgeText: '#92400e', border: '#fcd34d' },
    { status: 'Done', accent: '#16a34a', badgeBg: '#dcfce7', badgeText: '#166534', border: '#86efac' },
  ];

  if (total > 1) {
    if (index === 0) return stepTones[0];
    if (index === total - 1) return stepTones[4];
    if (index === total - 2) return stepTones[3];
    if (index === 1) return stepTones[1];
    return stepTones[2];
  }

  return stepTones[0];
}

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id;
  const { user, loading: authLoading } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [boardName, setBoardName] = useState('');

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const boardScrollRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) navigateWithTransition(router, '/login', { replace: true });
  }, [user, authLoading, router]);

  const loadBoard = useCallback(async () => {
    try {
      const data = await get(`/boards/${boardId}`);
      setBoard(data);
      setBoardName(data.name);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [boardId]);

  useEffect(() => {
    if (user && boardId) loadBoard();
  }, [user, boardId, loadBoard]);

  const updateScrollHints = useCallback(() => {
    const el = boardScrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 8);
  }, []);

  useEffect(() => {
    updateScrollHints();
    window.addEventListener('resize', updateScrollHints);
    return () => window.removeEventListener('resize', updateScrollHints);
  }, [updateScrollHints, board?.columns?.length]);

  const handleRename = async () => {
    if (!boardName.trim() || boardName === board.name) { setBoardName(board.name); setEditingName(false); return; }
    try {
      const updated = await patch(`/boards/${boardId}`, { name: boardName.trim() });
      setBoard((prev) => ({ ...prev, ...updated }));
      setEditingName(false);
    } catch (err) { setBoardName(board.name); setEditingName(false); }
  };

  const handleAddTask = (colId) => { setSelectedColumnId(colId); setShowTaskModal(true); };
  const handleTaskClick = (task) => { setSelectedTask(task); setShowTaskDetail(true); };

  const handleTaskCreated = (task) => setBoard((prev) => ({
    ...prev,
    columns: prev.columns.map((c) => c.id === task.column_id ? { ...c, tasks: [...(c.tasks || []), task] } : c),
  }));
  const handleColumnCreated = (col) => setBoard((prev) => ({ ...prev, columns: [...prev.columns, { ...col, tasks: [] }] }));
  const handleColumnDeleted = (colId) => setBoard((prev) => ({ ...prev, columns: prev.columns.filter((c) => c.id !== colId) }));
  const handleColumnUpdated = (updated) => setBoard((prev) => ({ ...prev, columns: prev.columns.map((c) => c.id === updated.id ? { ...c, ...updated } : c) }));
  const handleTaskUpdated = (updated) => setBoard((prev) => ({
    ...prev,
    columns: prev.columns.map((col) => ({ ...col, tasks: (col.tasks || []).map((t) => t.id === updated.id ? { ...t, ...updated } : t) })),
  }));
  const handleTaskDeleted = (taskId) => setBoard((prev) => ({
    ...prev,
    columns: prev.columns.map((col) => ({ ...col, tasks: (col.tasks || []).filter((t) => t.id !== taskId) })),
  }));

  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const newColumns = [...board.columns];
    const srcIdx = newColumns.findIndex((c) => c.id === source.droppableId);
    const destIdx = newColumns.findIndex((c) => c.id === destination.droppableId);
    const srcTasks = [...(newColumns[srcIdx].tasks || [])];
    const [moved] = srcTasks.splice(source.index, 1);
    if (srcIdx === destIdx) {
      srcTasks.splice(destination.index, 0, moved);
      newColumns[srcIdx] = { ...newColumns[srcIdx], tasks: srcTasks };
    } else {
      const destTasks = [...(newColumns[destIdx].tasks || [])];
      destTasks.splice(destination.index, 0, { ...moved, column_id: destination.droppableId });
      newColumns[srcIdx] = { ...newColumns[srcIdx], tasks: srcTasks };
      newColumns[destIdx] = { ...newColumns[destIdx], tasks: destTasks };
    }
    setBoard((prev) => ({ ...prev, columns: newColumns }));
    try {
      await patch(`/tasks/${draggableId}/move`, { column_id: destination.droppableId, position: destination.index });
    } catch (err) { loadBoard(); }
  };

  if (authLoading || loading || !board) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  return (
    <div className="app-layout">
      <Sidebar boardId={boardId} boardName={board.name} />
      <main className="app-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Projects</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Workspace</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <NotificationDropdown />
            <button onClick={() => setShowInviteModal(true)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px var(--accent-glow)',
            }}>+ Invite Member</button>
          </div>
        </div>

        {/* Board Header */}
        <div style={{ padding: '20px 28px 0', flexShrink: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {editingName ? (
                <input type="text" value={boardName} autoFocus
                  onChange={(e) => setBoardName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setBoardName(board.name); setEditingName(false); } }}
                  style={{
                    fontSize: 26, fontWeight: 800, border: 'none', borderBottom: '2px solid var(--accent)',
                    outline: 'none', background: 'transparent', color: 'var(--text-primary)', width: 380,
                  }}
                />
              ) : (
                <h1 onClick={() => setEditingName(true)} style={{
                  fontSize: 26, fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)',
                }} title="Click to rename">{board.name}</h1>
              )}

              {/* Member Avatars */}
              {board.members?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex' }}>
                    {board.members.slice(0, 4).map((m, i) => (
                      <div key={m.id} title={m.name} style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--accent)', border: '2px solid var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                        marginLeft: i > 0 ? -8 : 0,
                      }}>{m.name?.charAt(0).toUpperCase()}</div>
                    ))}
                    {board.members.length > 4 && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--surface)', border: '2px solid var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'var(--text-muted)', marginLeft: -8,
                      }}>+{board.members.length - 4}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setShowInviteModal(true)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
            }}>+ Invite Members</button>
          </div>

          {/* Column Headers Preview */}
        <div style={{ display: 'flex', gap: 16, paddingBottom: 0 }}>
          {board.columns.map((col, idx) => {
            const tone = getColumnTone(col.name, idx, board.columns.length);
            return (
            <div key={col.id} style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              padding: '4px 0', minWidth: 292,
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            }}>
              <span>{col.name}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 999,
                background: tone.badgeBg,
                color: tone.badgeText,
                border: `1px solid ${tone.border}`,
                fontSize: 10, fontWeight: 800,
              }}>{tone.status}</span>
              <span style={{ color: tone.accent, marginLeft: 2 }}>{(col.tasks || []).length}</span>
            </div>
          );
          })}
        </div>
      </div>

      {/* Kanban Columns */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0, paddingBottom: 2 }}>
          <div style={{
            position: 'absolute',
            top: 14,
            left: 28,
            zIndex: 3,
            pointerEvents: 'none',
            opacity: canScrollLeft ? 1 : 0,
            transition: 'opacity 0.2s ease',
            width: 56,
            height: 'calc(100% - 42px)',
            background: 'linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%)',
          }} />
          <div style={{
            position: 'absolute',
            top: 14,
            right: 28,
            zIndex: 3,
            pointerEvents: 'none',
            opacity: canScrollRight ? 1 : 0,
            transition: 'opacity 0.2s ease',
            width: 56,
            height: 'calc(100% - 42px)',
            background: 'linear-gradient(270deg, var(--bg-primary) 0%, transparent 100%)',
          }} />

          <div
            ref={boardScrollRef}
            className="board-scroll-area"
            onScroll={updateScrollHints}
            style={{
              flex: 1, overflowX: 'scroll', overflowY: 'hidden', padding: '20px 28px 24px',
              display: 'flex', gap: 16, alignItems: 'stretch',
              background: 'var(--bg-primary)',
              scrollbarGutter: 'stable both-edges',
              minHeight: 0,
              height: 'calc(100% - 2px)',
              borderBottom: '1px solid rgba(91, 94, 244, 0.14)',
              borderRadius: '0 0 18px 18px',
            }}
          >
            <DragDropContext onDragEnd={handleDragEnd}>
              {board.columns.map((col, idx) => (
                <ColumnCard
                  key={col.id} column={col} index={idx}
                  onAddTask={handleAddTask} onTaskClick={handleTaskClick}
                  onColumnDeleted={handleColumnDeleted} onColumnUpdated={handleColumnUpdated}
                />
              ))}
            </DragDropContext>

            {/* Add Column */}
            <button onClick={() => setShowColumnModal(true)} style={{
              minWidth: 292, maxWidth: 292,
              minHeight: 'calc(100vh - 210px)',
              padding: '16px',
              background: 'linear-gradient(180deg, rgba(91, 94, 244, 0.08) 0%, rgba(91, 94, 244, 0.03) 100%)',
              border: '2px dashed rgba(91, 94, 244, 0.22)',
              borderRadius: 18, color: '#4f46e5', fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = '#3730a3';
                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(91, 94, 244, 0.14) 0%, rgba(91, 94, 244, 0.06) 100%)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(91, 94, 244, 0.22)';
                e.currentTarget.style.color = '#4f46e5';
                e.currentTarget.style.background = 'linear-gradient(180deg, rgba(91, 94, 244, 0.08) 0%, rgba(91, 94, 244, 0.03) 100%)';
              }}
            >
              <span style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                background: 'var(--bg-card)',
                border: '1px dashed rgba(91, 94, 244, 0.3)',
                boxShadow: '0 8px 24px rgba(91, 94, 244, 0.08)',
              }}>+ Add Column</span>
            </button>
          </div>

        </div>

        {/* FAB */}
        <button onClick={() => setShowColumnModal(true)} style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff', fontSize: 24,
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20,
        }}>+</button>
      </main>

      <CreateColumnModal isOpen={showColumnModal} onClose={() => setShowColumnModal(false)} boardId={boardId} onCreated={handleColumnCreated} />
      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setSelectedColumnId(null); }}
        columnId={selectedColumnId}
        members={board.members || []}
        onCreated={handleTaskCreated}
      />
      <TaskDetailModal isOpen={showTaskDetail} onClose={() => { setShowTaskDetail(false); setSelectedTask(null); }} task={selectedTask} members={board.members} onUpdated={handleTaskUpdated} onDeleted={handleTaskDeleted} />
      <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} boardId={boardId} onInvited={() => loadBoard()} />
    </div>
  );
}

