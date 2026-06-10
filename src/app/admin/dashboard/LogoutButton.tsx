'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: '0.5rem 1.25rem',
        borderRadius: '0.5rem',
        backgroundColor: 'rgba(255,80,80,0.12)',
        color: '#ff8080',
        border: '1px solid rgba(255,80,80,0.25)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,80,80,0.22)'; }}
      onMouseOut={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,80,80,0.12)'; }}
    >
      {loading ? '로그아웃...' : '로그아웃'}
    </button>
  );
}
