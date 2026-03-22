'use client';

import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { patch, del } from '@/lib/api';

function getColumnTone(name = '') {
  const raw = String(name).toLowerCase();
  if (raw.includes('done') || raw.includes('complete') || raw.includes('finish') || raw.includes('closed')) {
    return {
      status: 'Completed',
      accent: '#16a34a',
      badgeBg: 'rgba(22,163,74,0.12)',
      badgeText: '#16a34a',
      border: 'rgba(22,163,74,0.25)',
      panelTop: 'rgba(22,163,74,0.10)',
      panelBottom: 'rgba(22,163,74,0.03)',
      surface: 'rgba(22,163,74,0.04)',
    };
  }
  if (raw.includes('review') || raw.includes('approve') || raw.includes('qa') || raw.includes('test')) {
    return {
      status: 'Review',
      accent: '#d97706',
      badgeBg: 'rgba(217,119,6,0.12)',
      badgeText: '#d97706',
      border: 'rgba(217,119,6,0.25)',
      panelTop: 'rgba(217,119,6,0.10)',
      panelBottom: 'rgba(217,119,6,0.03)',
      surface: 'rgba(217,119,6,0.04)',
    };
  }
  if (raw.includes('progress') || raw.includes('doing') || raw.includes('active')) {
    return {
      status: 'In Progress',
      accent: '#2563eb',
      badgeBg: 'rgba(37,99,235,0.12)',
      badgeText: '#60a5fa',
      border: 'rgba(37,99,235,0.25)',
      panelTop: 'rgba(37,99,235,0.10)',
      panelBottom: 'rgba(37,99,235,0.03)',
      surface: 'rgba(37,99,235,0.04)',
    };
  }
  return {
    status: 'To Do',
    accent: '#7c3aed',
    badgeBg: 'rgba(124,58,237,0.12)',
    badgeText: '#a78bfa',
    border: 'rgba(124,58,237,0.25)',
    panelTop: 'rgba(124,58,237,0.10)',
    panelBottom: 'rgba(124,58,237,0.03)',
    surface: 'rgba(124,58,237,0.04)',
  };
}

export default function ColumnCard({ column, index, onAddTask, onTaskClick, onColumnDeleted, onColumnUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const taskCount = (column.tasks || []).length;
  const tone = getColumnTone(column.name);

  const handleRename = async () => {
    if (!name.trim() || name === column.name) { setName(column.name); setEditing(false); return; }
    try {
      const updated = await patch(`/columns/${column.id}`, { name: name.trim() });
      onColumnUpdated?.(updated);
      setEditing(false);
    } catch (err) { setName(column.name); setEditing(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete column "${column.name}"?`)) return;
    try {
      await del(`/columns/${column.id}`);
      onColumnDeleted?.(column.id);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{
      minWidth: 292, maxWidth: 292, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)',
      borderRadius: 18,
      border: `1px solid ${tone.border}`,
      boxShadow: 'var(--shadow-md)',
      maxHeight: 'calc(100vh - 210px)',
      minHeight: 'calc(100vh - 210px)',
      overflow: 'hidden',
    }}>
      {/* Column Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        background: `linear-gradient(180deg, ${tone.panelTop} 0%, ${tone.panelBottom} 100%)`,
        borderBottom: `1px solid ${tone.border}`,
      }}>
        {editing ? (
          <input
            type="text" value={name} autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setName(column.name); setEditing(false); } }}
            style={{
              fontSize: 13, fontWeight: 700, border: 'none',
              borderBottom: '2px solid var(--accent)', outline: 'none',
              background: 'transparent', color: 'var(--text-primary)', flex: 1,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: tone.accent,
              boxShadow: `0 0 0 4px ${tone.badgeBg}`,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.7px', color: 'var(--text-secondary)',
            }}>{column.name}</span>
            <span style={{
              background: tone.badgeBg,
              color: tone.badgeText,
              border: `1px solid ${tone.border}`,
              borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.3px',
            }}>{tone.status}</span>
            <span style={{
              background: 'var(--accent-bg)', color: 'var(--accent)',
              border: `1px solid ${tone.border}`,
              borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800,
              minWidth: 28, textAlign: 'center',
            }}>{taskCount}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => setEditing(true)} title="Rename" style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '3px 5px', borderRadius: 5, fontSize: 13,
            transition: 'all 0.15s',
          }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >✎</button>
          <button onClick={handleDelete} title="Delete column" style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: '3px 5px', borderRadius: 5, fontSize: 13,
            transition: 'all 0.15s',
          }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >🗑</button>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '12px 10px 10px',
              display: 'flex', flexDirection: 'column', gap: 8,
              minHeight: 60,
              background: snapshot.isDraggingOver ? tone.badgeBg : tone.surface,
              borderRadius: 14, transition: 'background 0.2s',
            }}
          >
            {(column.tasks || []).map((task, idx) => (
              <Draggable key={task.id} draggableId={task.id} index={idx}>
                {(provided) => <TaskCard task={task} onClick={onTaskClick} provided={provided} columnStatus={tone.status} />}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task */}
      <button
        onClick={() => onAddTask(column.id)}
        style={{
          margin: '2px 10px 12px', padding: '12px 14px',
          background: 'transparent',
          border: `1.5px dashed ${tone.border}`,
          borderRadius: 14, color: tone.accent, fontSize: 13,
          fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 6,
          justifyContent: 'center',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = tone.accent;
          e.currentTarget.style.background = tone.badgeBg;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = tone.border;
          e.currentTarget.style.background = 'transparent';
        }}
      >+ Add task</button>
    </div>
  );
}
