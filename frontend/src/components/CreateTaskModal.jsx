'use client';

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { post } from '@/lib/api';
import AssignMemberDropdown from './AssignMemberDropdown';

const TAG_COLORS = ['blue', 'green', 'yellow', 'red', 'purple', 'pink'];
const ROLE_TAGS = ['Frontend', 'Backend', 'Design', 'QA', 'DevOps', 'Manager'];

export default function CreateTaskModal({ isOpen, onClose, columnId, onCreated, members = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [assigneeId, setAssigneeId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setAssigneeId(null);
  }, [isOpen]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleRoleTag = (role) => {
    setTags((prev) => prev.includes(role) ? prev.filter((t) => t !== role) : [...prev, role]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const task = await post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        column_id: columnId,
        tags,
        assignee_id: assigneeId,
      });
      setTitle('');
      setDescription('');
      setTags([]);
      setAssigneeId(null);
      onCreated(task);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    marginBottom: 14,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit}>
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title" autoFocus style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)" rows={3}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Assign To
          </div>
          <AssignMemberDropdown
            members={members}
            currentAssignee={assigneeId}
            onAssign={setAssigneeId}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Select Role
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ROLE_TAGS.map((role, i) => {
                const active = tags.includes(role);
                const color = `var(--tag-${TAG_COLORS[i % TAG_COLORS.length]})`;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRoleTag(role)}
                    style={{
                      padding: '6px 11px',
                      borderRadius: 999,
                      border: `1.5px solid ${active ? color : 'var(--border)'}`,
                      background: active ? `${color}20` : '#fff',
                      color: active ? color : 'var(--text-secondary)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add tag..."
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="button" onClick={addTag} style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: 'var(--surface)', color: 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>Add</button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.map((tag, i) => (
                <span key={tag} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: `var(--tag-${TAG_COLORS[i % TAG_COLORS.length]})20`,
                  color: `var(--tag-${TAG_COLORS[i % TAG_COLORS.length]})`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tag}
                  <span style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => removeTag(tag)}>×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !title.trim()} style={{
          width: '100%', padding: '11px', borderRadius: 10, border: 'none',
          background: !title.trim() ? 'var(--surface)' : 'var(--accent)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: !title.trim() ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </Modal>
  );
}
