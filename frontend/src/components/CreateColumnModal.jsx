'use client';

import { useState } from 'react';
import Modal from './Modal';
import { post } from '@/lib/api';

export default function CreateColumnModal({ isOpen, onClose, boardId, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const col = await post('/columns', { name: name.trim(), board_id: boardId });
      setName('');
      onCreated(col);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
      <form onSubmit={handleSubmit}>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Column name (e.g. To Do)" autoFocus
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            marginBottom: 16,
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button type="submit" disabled={loading || !name.trim()} style={{
          width: '100%', padding: '11px', borderRadius: 10, border: 'none',
          background: !name.trim() ? 'var(--surface)' : 'var(--accent)',
          color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: !name.trim() ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Adding...' : 'Add Column'}
        </button>
      </form>
    </Modal>
  );
}
