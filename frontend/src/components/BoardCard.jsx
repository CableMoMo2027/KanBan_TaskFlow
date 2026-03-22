'use client';

import Link from 'next/link';

export default function BoardCard({ board, onDelete }) {
  const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const colorIndex = board.name.length % colors.length;
  const accentColor = colors[colorIndex];

  return (
    <Link href={`/board/${board.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="animate-fade-in"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24, cursor: 'pointer',
          transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}20`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
        }} />

        <h3 style={{
          margin: '8px 0 8px', fontSize: 17, fontWeight: 700,
          color: 'var(--text-primary)',
        }}>{board.name}</h3>

        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          Created {new Date(board.created_at).toLocaleDateString()}
        </p>

        {onDelete && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(board.id); }}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 16, cursor: 'pointer', padding: '2px 6px', borderRadius: 6,
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--danger)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
          >🗑</button>
        )}
      </div>
    </Link>
  );
}
