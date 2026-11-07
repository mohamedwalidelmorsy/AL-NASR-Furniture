'use client';

export function SkipLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById('main')?.focus()}
      className="sf0"
      style={{ position: 'absolute', top: '8px', insetInlineStart: '8px', zIndex: 100, padding: '10px 16px', background: '#584838', color: '#fff', border: 0, borderRadius: '6px', fontWeight: 600, transform: 'translateY(-200%)' }}
    >
      {label}
    </button>
  );
}
