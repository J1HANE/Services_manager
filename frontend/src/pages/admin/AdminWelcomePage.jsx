import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  LayoutDashboard, Users, Package, Inbox, Star, AlertTriangle,
  FileCheck2, Shield, ArrowRight, TrendingUp, DollarSign, Activity
} from 'lucide-react';

const WelcomeCard = ({ icon: Icon, title, description, onClick, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-4">{description}</p>
    <div className="flex items-center text-amber-600 font-semibold group-hover:gap-2 transition-all">
      <span>Accéder</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

export default function AdminWelcomePage() {
  const navigate = useNavigate();

  const raw = localStorage.getItem('user');
  const user = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;

  const sections = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Vue d\'ensemble des statistiques, graphiques et commissions',
      path: '/admin/dashboard',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Utilisateurs',
      description: 'Gérer les clients, intervenants et administrateurs',
      path: '/admin/utilisateurs',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Package,
      title: 'Services',
      description: 'Modérer et gérer les services publiés',
      path: '/admin/services',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Inbox,
      title: 'Demandes',
      description: 'Suivre et gérer les demandes de service',
      path: '/admin/demandes',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Star,
      title: 'Évaluations',
      description: 'Consulter et modérer les avis clients',
      path: '/admin/evaluations',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: AlertTriangle,
      title: 'Réclamations',
      description: 'Traiter les réclamations des clients et intervenants',
      path: '/admin/reclamations',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: FileCheck2,
      title: 'Documents',
      description: 'Valider les justificatifs des intervenants',
      path: '/admin/documents',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <AdminGuard>
      <AdminLayout title="Bienvenue">
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30"
            >
              <Shield className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Bienvenue dans l'Espace Admin
            </h1>
            <p className="text-xl text-slate-600 mb-2">
              {user?.nom && user?.prenom 
                ? `Bonjour ${user.prenom} ${user.nom}`
                : `Bonjour ${user?.email || 'Administrateur'}`
              }
            </p>
            <p className="text-slate-500">
              Gérez votre plateforme ServicePro depuis cette interface
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm text-blue-600 font-medium">Accès Rapide</div>
                  <div className="text-2xl font-bold text-blue-900">Dashboard</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm text-amber-600 font-medium">Commissions</div>
                  <div className="text-2xl font-bold text-amber-900">20%</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-sm text-green-600 font-medium">Plateforme</div>
                  <div className="text-2xl font-bold text-green-900">Active</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sections Grid */}
          <div className="w-full max-w-6xl">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-slate-900 mb-8 text-center"
            >
              Choisissez une section
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <WelcomeCard
                  key={section.path}
                  {...section}
                  onClick={() => navigate(section.path)}
                  delay={0.5 + index * 0.1}
                />
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center text-slate-500 text-sm"
          >
            <p>ServicePro - Plateforme de mise en relation</p>
            <p className="mt-1">Version Admin 1.0</p>
          </motion.div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

