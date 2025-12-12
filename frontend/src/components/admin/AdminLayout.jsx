import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileCheck2, LogOut, Shield, Package, Star, 
  Inbox, AlertTriangle, Menu, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30'
            : 'text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="font-semibold flex-1">{label}</span>
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </Link>
    </motion.div>
  );
};

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const raw = localStorage.getItem('user');
  const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/connexion');
  };

  const navItems = [
    { to: '/admin', icon: Shield, label: 'Accueil' },
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/services', icon: Package, label: 'Services' },
    { to: '/admin/demandes', icon: Inbox, label: 'Demandes' },
    { to: '/admin/evaluations', icon: Star, label: 'Évaluations' },
    { to: '/admin/reclamations', icon: AlertTriangle, label: 'Réclamations' },
    { to: '/admin/documents', icon: FileCheck2, label: 'Documents' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-72 bg-white/95 backdrop-blur-lg border-r border-slate-200/50 min-h-screen p-6 z-40">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 px-2 py-3 mb-8"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"
            >
              <Shield className="w-7 h-7" />
            </motion.div>
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Admin Panel
              </div>
              <div className="text-xs text-slate-500 font-medium">ServicePro</div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <NavItem {...item} />
              </motion.div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-auto pt-6 border-t border-slate-200"
          >
            <div className="px-2 mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-amber-50">
              <div className="text-xs text-slate-500 mb-1">Connecté en tant que</div>
              <div className="font-semibold text-slate-900 truncate">{user?.email || 'Admin'}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Déconnexion</span>
            </motion.button>
          </motion.div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed md:hidden w-72 bg-white/95 backdrop-blur-lg border-r border-slate-200/50 min-h-screen p-6 shadow-xl z-40"
              >
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 px-2 py-3 mb-8"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30"
                  >
                    <Shield className="w-7 h-7" />
                  </motion.div>
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Admin Panel
                    </div>
                    <div className="text-xs text-slate-500 font-medium">ServicePro</div>
                  </div>
                </motion.div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <NavItem
                        {...item}
                        onClick={() => setSidebarOpen(false)}
                      />
                    </motion.div>
                  ))}
                </nav>

                {/* User Info & Logout */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto pt-6 border-t border-slate-200"
                >
                  <div className="px-2 mb-4 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-amber-50">
                    <div className="text-xs text-slate-500 mb-1">Connecté en tant que</div>
                    <div className="font-semibold text-slate-900 truncate">{user?.email || 'Admin'}</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-semibold">Déconnexion</span>
                  </motion.button>
                </motion.div>
              </motion.aside>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="md:hidden fixed inset-0 bg-black/50 z-30"
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">Administration</div>
                <motion.h1
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mt-1"
                >
                  {title}
                </motion.h1>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-amber-300 transition-all font-medium"
                >
                  ← Retour au site
                </Link>
              </motion.div>
            </div>
          </motion.header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
