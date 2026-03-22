'use client';

function getStatusMeta(columnStatus, taskStatus) {
  const raw = String(taskStatus === 'completed' ? 'completed' : columnStatus || '').toLowerCase();
  if (raw.includes('done') || raw.includes('complete') || raw.includes('finish') || raw.includes('closed')) {
    return {
      label: 'Completed',
      tone: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
      isDone: true,
    };
  }
  if (raw.includes('review') || raw.includes('approve') || raw.includes('qa') || raw.includes('test')) {
    return {
      label: 'Review',
      tone: { bg: 'rgba(217,119,6,0.12)', text: '#fbbf24', border: 'rgba(217,119,6,0.25)' },
      isDone: false,
    };
  }
  if (raw.includes('progress') || raw.includes('doing') || raw.includes('active')) {
    return {
      label: 'In Progress',
      tone: { bg: 'rgba(37,99,235,0.12)', text: '#60a5fa', border: 'rgba(37,99,235,0.25)' },
      isDone: false,
    };
  }
  return {
    label: 'To Do',
    tone: { bg: 'rgba(124,58,237,0.12)', text: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
    isDone: false,
  };
}

const TAG_PALETTE = {
  blue:   { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa' },
  green:  { bg: 'rgba(16,185,129,0.12)',  text: '#34d399' },
  yellow: { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24' },
  red:    { bg: 'rgba(239,68,68,0.12)',   text: '#f87171' },
  purple: { bg: 'rgba(139,92,246,0.12)',  text: '#a78bfa' },
  pink:   { bg: 'rgba(236,72,153,0.12)',  text: '#f472b6' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',   text: '#22d3ee' },
  orange: { bg: 'rgba(249,115,22,0.12)',  text: '#fb923c' },
};
const PALETTE_KEYS = Object.keys(TAG_PALETTE);

export default function TaskCard({ task, onClick, provided, columnStatus }) {
  const statusMeta = getStatusMeta(columnStatus, task.status);
  const tags = [statusMeta.label, ...((task.tags || []).filter((tag) => tag && tag !== statusMeta.label))];

  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={() => onClick?.(task)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 10,
        padding: '14px 14px',
        cursor: 'pointer',
        border: `1px solid ${statusMeta.isDone ? statusMeta.tone.border : 'var(--border)'}`,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.15s',
        ...(provided?.draggableProps?.style || {}),
      }}
      onMouseOver={(e) => {
        if (!provided?.draggableProps?.style?.position) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--accent-light)';
        }
      }}
      onMouseOut={(e) => {
        if (!provided?.draggableProps?.style?.position) {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = statusMeta.isDone ? statusMeta.tone.border : 'var(--border)';
        }
      }}
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {tags.map((tag, i) => {
            const palette = i === 0
              ? statusMeta.tone
              : TAG_PALETTE[PALETTE_KEYS[i % PALETTE_KEYS.length]];
            return (
              <span key={tag} style={{
                padding: '2px 9px', borderRadius: 20,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.3px',
                textTransform: 'uppercase',
                background: palette.bg, color: palette.text,
                border: `1px solid ${palette.border || 'transparent'}`,
              }}>{tag}</span>
            );
          })}
        </div>
      )}

      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {task.title}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: statusMeta.tone.text,
            boxShadow: `0 0 0 4px ${statusMeta.tone.bg}`,
          }} />
          {task.assignee_id && (
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: statusMeta.isDone ? 'var(--success)' : 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff',
            }}>•</div>
          )}
        </div>
        {task.description && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            <span>💬</span>
            <span>1</span>
          </div>
        )}
      </div>
    </div>
  );
}
