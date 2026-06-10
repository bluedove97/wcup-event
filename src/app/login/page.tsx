'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.userName) router.replace('/'); })
      .catch(() => {});

    inputRef.current?.focus();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/');
      } else {
        setError(data.error || '등록된 참여자가 아닙니다.');
        setName('');
        inputRef.current?.focus();
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '1rem',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚽</div>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '0.5rem' }}>
            2026 FIFA WORLD CUP
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            참여자 확인
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            이름을 입력하여 이벤트에 참여하세요
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="이름 입력"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: 'var(--navy)',
                color: 'var(--text-primary)',
                border: error ? '1px solid rgba(255,80,80,0.5)' : '1px solid rgba(255,255,255,0.08)',
                fontSize: '1rem',
                fontWeight: 500,
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(255,80,80,0.1)',
                color: '#ff8080',
                borderRadius: '0.5rem',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '0.625rem',
              backgroundColor: loading ? 'rgba(201,168,76,0.4)' : 'var(--gold)',
              color: 'var(--navy-dark)',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s, background-color 0.15s',
            }}
            onMouseOver={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold-light)';
            }}
            onMouseOut={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold)';
            }}
            onMouseDown={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            {loading ? '확인 중...' : '참여하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
