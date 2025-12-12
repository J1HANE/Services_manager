import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const raw = localStorage.getItem('user');
  const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
