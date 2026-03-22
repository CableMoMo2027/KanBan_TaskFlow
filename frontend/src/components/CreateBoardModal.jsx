'use client';

import { useState } from 'react';
import { post } from '@/lib/api';

const PRESET_COLORS = [
  '#5b5ef4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6',
  '#f97316', '#84cc16', '#6366f1', '#0ea5e9',
];

export default function CreateBoardModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const board = await post('/boards', {
        name: name.trim(),
        description: description.trim(),
        color,
      });
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      onCreated(board);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid var(--border)', background: '#fff',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit',
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
      }} />

      {/* Modal */}
      <div className="animate-scale-in" style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '92vw', maxWidth: 500,
        background: '#fff', borderRadius: 18,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 1001, overflow: 'hidden',
      }}>
        {/* Preview header strip */}
        <div style={{
          height: 8, background: color,
          transition: 'background 0.2s',
        }} />

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Create New Board</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Set up your workspace</p>
            </div>
            <button onClick={onClose} style={{
              background: 'var(--surface)', border: 'none', cursor: 'pointer',
              width: 30, height: 30, borderRadius: 8, fontSize: 16,
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)', border: '1px solid #fca5a5',
              borderRadius: 8, padding: '8px 12px', marginBottom: 16,
              fontSize: 13, color: 'var(--danger)',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Board Name *
              </label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Roadmap" autoFocus required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = color}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Description
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this board for?"
                rows={2}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                onFocus={(e) => e.target.style.borderColor = color}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Color picker */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Board Color
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c} type="button" onClick={() => setColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, background: c,
                      border: color === c ? `3px solid ${c}` : '3px solid transparent',
                      outline: color === c ? `2px solid white` : 'none',
                      outlineOffset: '-5px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              border: `2px solid ${color}22`,
              background: `${color}08`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 800,
              }}>{name.charAt(0).toUpperCase() || '?'}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{name || 'Board name'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{description || 'No description'}</div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !name.trim()} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: !name.trim() ? 'var(--surface)' : color,
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: name.trim() ? `0 4px 14px ${color}44` : 'none',
            }}>
              {loading ? 'Creating...' : '+ Create Board'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
