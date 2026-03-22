'use client';

import { useState, useEffect } from 'react';
import AssignMemberDropdown from './AssignMemberDropdown';
import { patch, del } from '@/lib/api';

const TAG_PALETTE = {
  blue: { bg: '#dbeafe', text: '#1d4ed8' },
  green: { bg: '#d1fae5', text: '#065f46' },
  yellow: { bg: '#fef3c7', text: '#92400e' },
  red: { bg: '#fee2e2', text: '#991b1b' },
  purple: { bg: '#ede9fe', text: '#5b21b6' },
  pink: { bg: '#fce7f3', text: '#9d174d' },
};
const PALETTE_KEYS = Object.keys(TAG_PALETTE);
const ROLE_TAGS = ['Frontend', 'Backend', 'Design', 'QA', 'DevOps', 'Manager'];

export default function TaskDetailModal({ isOpen, onClose, task, members, onUpdated, onDeleted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setTags(task.tags || []);
      setCompleted(task.status === 'completed');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await patch(`/tasks/${task.id}`, { title, description, tags });
      onUpdated(updated);
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleToggleComplete = async () => {
    const newStatus = completed ? 'in_progress' : 'completed';
    try {
      const updated = await patch(`/tasks/${task.id}`, { status: newStatus });
      setCompleted(!completed);
      onUpdated({ ...updated, status: newStatus });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await del(`/tasks/${task.id}`);
      onDeleted(task.id);
      onClose();
    } catch (err) { console.error(err); }
  };

  const handleAssign = async (userId) => {
    try {
      const updated = await patch(`/tasks/${task.id}/assign`, { assignee_id: userId });
      onUpdated(updated);
    } catch (err) { console.error(err); }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };

  const toggleRoleTag = (role) => {
    setTags((prev) => prev.includes(role) ? prev.filter((t) => t !== role) : [...prev, role]);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
      }} />

      {/* Modal */}
      <div className="animate-scale-in" style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '94vw', maxWidth: 1120, minHeight: '72vh', maxHeight: '92vh',
        background: '#fff', borderRadius: 18,
        boxShadow: 'var(--shadow-xl)',
        zIndex: 1001, overflow: 'hidden',
        display: 'flex',
      }}>
        {/* Left column — Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 36px 32px' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Task
          </div>

          {/* Title */}
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: 22, fontWeight: 800, border: 'none', outline: 'none',
              width: '100%', color: 'var(--text-primary)', background: 'transparent',
              lineHeight: 1.3, marginBottom: 18,
            }}
          />

          {/* Status chips */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: completed ? 'var(--success-bg)' : 'var(--accent-bg)',
                color: completed ? 'var(--success)' : 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.3s',
              }}>● {completed ? 'Completed' : 'In Progress'}</span>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Description</span>
              <button onClick={() => setEditingDesc(!editingDesc)} style={{
                background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12,
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>✎ Edit</button>
            </div>
            {editingDesc ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={5}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  border: '1.5px solid var(--accent)', outline: 'none',
                  background: '#fff', fontSize: 13, color: 'var(--text-primary)',
                  resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                style={{
                  fontSize: 13, color: description ? 'var(--text-secondary)' : 'var(--text-muted)',
                  lineHeight: 1.7, cursor: 'text', minHeight: 60,
                  padding: '8px', borderRadius: 6, border: '1.5px solid transparent',
                  transition: 'border-color 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                {description || 'Click to add a description...'}
              </div>
            )}
          </div>

          {/* Save + Complete buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '10px 20px', borderRadius: 9, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px var(--accent-glow)',
              transition: 'all 0.2s',
            }}>{saving ? 'Saving...' : 'Save Changes'}</button>

            <button onClick={handleToggleComplete} style={{
              padding: '10px 20px', borderRadius: 9, border: 'none',
              background: completed ? 'var(--success)' : '#fff',
              color: completed ? '#fff' : 'var(--success)',
              border: `2px solid var(--success)`,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: completed ? '0 2px 10px rgba(16,185,129,0.3)' : 'none',
            }}>
              {completed ? '✓ Completed' : '○ Mark as Complete'}
            </button>
          </div>
        </div>

        {/* Right column — Sidebar */}
        <div style={{
          width: 320, borderLeft: '1px solid var(--border)',
          background: '#fafafa', padding: '36px 28px 32px',
          overflowY: 'auto', flexShrink: 0,
        }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 20, lineHeight: 1,
          }}>×</button>

          {/* Assignees */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Assignees</div>
            <AssignMemberDropdown members={members || []} currentAssignee={task.assignee_id} onAssign={handleAssign} />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Tags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {ROLE_TAGS.map((role, i) => {
                const active = tags.includes(role);
                const p = TAG_PALETTE[PALETTE_KEYS[i % PALETTE_KEYS.length]];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRoleTag(role)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      border: `1.5px solid ${active ? p.text : 'var(--border)'}`,
                      background: active ? p.bg : '#fff',
                      color: active ? p.text : 'var(--text-secondary)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {tags.map((tag, i) => {
                const p = TAG_PALETTE[PALETTE_KEYS[i % PALETTE_KEYS.length]];
                return (
                  <span key={tag} style={{
                    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: p.bg, color: p.text, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {tag}
                    <span style={{ cursor: 'pointer', fontSize: 13, lineHeight: 1 }} onClick={() => setTags(tags.filter((t) => t !== tag))}>×</span>
                  </span>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add custom tag..."
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: '#fff',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <button type="button" onClick={addTag} style={{
                padding: '8px 10px', borderRadius: 8,
                border: '1px solid var(--border)', background: '#fff',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>Add</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} style={{
              padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)',
              background: '#fff', color: 'var(--text-secondary)', fontSize: 12,
              fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>⇗ Share Task</button>
            <button onClick={handleDelete} style={{
              background: 'none', border: 'none', color: 'var(--danger)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              padding: '8px 4px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>🗑 Delete Task</button>
          </div>
        </div>
      </div>
    </>
  );
}
