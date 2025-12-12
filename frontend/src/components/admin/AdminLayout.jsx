import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileCheck2, LogOut, Shield, Package, Star, Inbox } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
          : 'text-amber-900 hover:bg-orange-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-semibold">{label}</span>
    </Link>
  );
};

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();

  const raw = localStorage.getItem('user');
  const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/connexion');
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-72 bg-white border-r border-slate-200 min-h-screen p-4">
          <div className="flex items-center gap-3 px-2 py-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">Admin</div>
              <div className="text-sm text-slate-500">ServicePro</div>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/utilisateurs" icon={Users} label="Utilisateurs" />
            <NavItem to="/admin/services" icon={Package} label="Services" />
            <NavItem to="/admin/demandes" icon={Inbox} label="Demandes" />
            <NavItem to="/admin/evaluations" icon={Star} label="Évaluations" />
            <NavItem to="/admin/documents" icon={FileCheck2} label="Documents" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="px-2 mb-3 text-sm text-slate-600">
              Connecté: <span className="font-semibold">{user?.email || 'Admin'}</span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Administration</div>
                <div className="text-2xl font-bold text-slate-900">{title}</div>
              </div>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Retour au site
              </Link>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
