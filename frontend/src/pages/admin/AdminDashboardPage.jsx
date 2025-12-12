import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users, Briefcase, FileText, Shield, CheckCircle, XCircle,
  Archive, Clock, TrendingUp, AlertCircle, ArrowRight,
  UserCheck, UserX, Package, PackageCheck, FileCheck2, Star, Inbox,
  DollarSign, AlertTriangle, Activity
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ icon: Icon, label, value, color = 'from-amber-500 to-orange-600', onClick, actionLabel, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className={`p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      {onClick && (
        <ArrowRight className="w-5 h-5 text-slate-400" />
      )}
    </div>
    <div>
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-slate-900">{value ?? '--'}</div>
        {trend && (
          <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {actionLabel && onClick && (
        <div className="mt-3 text-xs text-amber-600 font-medium">{actionLabel}</div>
      )}
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, onClick, color = 'bg-slate-900' }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 ${color} text-white rounded-xl transition-all shadow-lg hover:shadow-xl`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-semibold">{label}</span>
  </motion.button>
);

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Dashboard">
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
            />
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <AdminLayout title="Dashboard">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  // Données pour graphiques
  const commissionsData = {
    labels: stats?.commissions_par_mois?.map(m => m.mois) || [],
    datasets: [{
      label: 'Commissions (DH)',
      data: stats?.commissions_par_mois?.map(m => m.commission) || [],
      borderColor: 'rgb(251, 146, 60)',
      backgroundColor: 'rgba(251, 146, 60, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  const demandesStatutData = {
    labels: ['En attente', 'Acceptées', 'Terminées', 'Refusées'],
    datasets: [{
      data: [
        stats?.demandes_par_statut?.en_attente || 0,
        stats?.demandes_par_statut?.accepte || 0,
        stats?.demandes_par_statut?.termine || 0,
        stats?.demandes_par_statut?.refuse || 0,
      ],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  const servicesTypeData = {
    labels: Object.keys(stats?.services_par_type || {}),
    datasets: [{
      label: 'Services',
      data: Object.values(stats?.services_par_type || {}),
      backgroundColor: [
        'rgba(251, 146, 60, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const commissionGrowth = stats?.commissions_mois_dernier > 0
    ? ((stats.commissions_ce_mois - stats.commissions_mois_dernier) / stats.commissions_mois_dernier * 100).toFixed(1)
    : 0;

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        {/* Section Commissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-600" />
              Commissions & Revenus
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={DollarSign}
              label="Total Commissions"
              value={`${(stats?.commissions_total || 0).toFixed(2)} DH`}
              color="from-emerald-500 to-green-600"
              trend={parseFloat(commissionGrowth)}
            />
            <StatCard
              icon={TrendingUp}
              label="Ce Mois"
              value={`${(stats?.commissions_ce_mois || 0).toFixed(2)} DH`}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Activity}
              label="Affaires Terminées"
              value={stats?.affaires_terminees || 0}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Affaires Ce Mois"
              value={stats?.affaires_ce_mois || 0}
              color="from-amber-500 to-orange-600"
            />
          </div>
        </motion.div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Évolution des Commissions</h3>
            <div className="h-64">
              <Line data={commissionsData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Demandes par Statut</h3>
            <div className="h-64">
              <Doughnut data={demandesStatutData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Services par Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Services par Type</h3>
          <div className="h-64">
            <Bar data={servicesTypeData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              icon={FileCheck2}
              label="Documents en attente"
              onClick={() => navigate('/admin/documents')}
              color="bg-amber-600"
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="Réclamations"
              onClick={() => navigate('/admin/reclamations')}
              color="bg-red-600"
            />
            <QuickActionButton
              icon={Users}
              label="Gérer les utilisateurs"
              onClick={() => navigate('/admin/utilisateurs')}
              color="bg-blue-600"
            />
            <QuickActionButton
              icon={Package}
              label="Gérer les services"
              onClick={() => navigate('/admin/services')}
              color="bg-green-600"
            />
          </div>
        </motion.div>

        {/* Main Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statistiques Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Total Utilisateurs"
              value={stats?.users}
              color="from-blue-500 to-blue-600"
              onClick={() => navigate('/admin/utilisateurs')}
              actionLabel="Voir tous →"
            />
            <StatCard
              icon={Briefcase}
              label="Intervenants"
              value={stats?.intervenants}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={Shield}
              label="Clients"
              value={stats?.clients}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={Package}
              label="Services"
              value={stats?.services}
              color="from-amber-500 to-orange-600"
              onClick={() => navigate('/admin/services')}
              actionLabel="Gérer →"
            />
          </div>
        </motion.div>

        {/* Users Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statut des Utilisateurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={UserCheck}
              label="Utilisateurs Vérifiés"
              value={stats?.users_verifies}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={UserX}
              label="Utilisateurs Bannis"
              value={stats?.users_bannis}
              color="from-red-500 to-red-600"
              onClick={() => navigate('/admin/utilisateurs?is_banned=true')}
              actionLabel="Voir →"
            />
            <StatCard
              icon={CheckCircle}
              label="Admins"
              value={stats?.admins}
              color="from-indigo-500 to-indigo-600"
            />
          </div>
        </motion.div>

        {/* Services Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statut des Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={PackageCheck}
              label="Services Actifs"
              value={stats?.services_actifs}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={Archive}
              label="Services Archivés"
              value={stats?.services_archives}
              color="from-slate-500 to-slate-600"
              onClick={() => navigate('/admin/services?statut=archive')}
              actionLabel="Voir →"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Services"
              value={stats?.services}
              color="from-amber-500 to-orange-600"
            />
          </div>
        </motion.div>

        {/* Demandes Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statut des Demandes</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={Clock}
              label="En Attente"
              value={stats?.demandes_en_attente}
              color="from-yellow-500 to-yellow-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Acceptées"
              value={stats?.demandes_acceptees}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={FileText}
              label="Terminées"
              value={stats?.demandes_terminees}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Demandes"
              value={stats?.demandes}
              color="from-purple-500 to-purple-600"
            />
          </div>
        </motion.div>

        {/* Réclamations Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Réclamations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={AlertTriangle}
              label="En Attente"
              value={stats?.reclamations_en_attente}
              color="from-red-500 to-red-600"
              onClick={() => navigate('/admin/reclamations?statut=en_attente')}
              actionLabel="Voir →"
            />
            <StatCard
              icon={Clock}
              label="En Cours"
              value={stats?.reclamations_en_cours}
              color="from-yellow-500 to-yellow-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Résolues"
              value={stats?.reclamations_resolue}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={AlertCircle}
              label="Total Réclamations"
              value={stats?.reclamations}
              color="from-slate-500 to-slate-600"
              onClick={() => navigate('/admin/reclamations')}
              actionLabel="Gérer →"
            />
          </div>
        </motion.div>

        {/* Documents Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Statut des Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={AlertCircle}
              label="En Attente"
              value={stats?.documents_en_attente}
              color="from-amber-500 to-orange-600"
              onClick={() => navigate('/admin/documents?statut=en_attente')}
              actionLabel="Vérifier →"
            />
            <StatCard
              icon={CheckCircle}
              label="Validés"
              value={stats?.documents_valides}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={XCircle}
              label="Refusés"
              value={stats?.documents_refuses}
              color="from-red-500 to-red-600"
            />
          </div>
        </motion.div>
      </AdminLayout>
    </AdminGuard>
  );
}
