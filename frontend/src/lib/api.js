'use client';

import { dispatchNavigation } from './navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatchNavigation('/login', { replace: true });
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

export function get(endpoint) {
  return api(endpoint);
}

export function post(endpoint, data) {
  return api(endpoint, { method: 'POST', body: JSON.stringify(data) });
}

export function patch(endpoint, data) {
  return api(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
}

export function del(endpoint) {
  return api(endpoint, { method: 'DELETE' });
}
