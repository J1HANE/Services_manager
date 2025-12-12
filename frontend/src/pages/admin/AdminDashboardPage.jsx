import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Users, Briefcase, FileText, Shield, CheckCircle, XCircle, 
  Archive, Clock, TrendingUp, AlertCircle, ArrowRight,
  UserCheck, UserX, Package, PackageCheck, FileCheck2, Star
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color = 'from-amber-500 to-orange-600', onClick, actionLabel }) => (
  <div 
    className={`p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        <Icon className="w-7 h-7" />
      </div>
      {onClick && (
        <ArrowRight className="w-5 h-5 text-slate-400" />
      )}
    </div>
    <div>
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value ?? '--'}</div>
      {actionLabel && onClick && (
        <div className="mt-3 text-xs text-amber-600 font-medium">{actionLabel}</div>
      )}
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick, color = 'bg-slate-900' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 ${color} text-white rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-semibold">{label}</span>
  </button>
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
            <div className="text-slate-600">Chargement des statistiques...</div>
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

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              icon={FileCheck2}
              label="Documents en attente"
              onClick={() => navigate('/admin/documents')}
              color="bg-amber-600"
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
            <QuickActionButton
              icon={Star}
              label="Vérifier les évaluations"
              onClick={() => navigate('/admin/evaluations')}
              color="bg-purple-600"
            />
          </div>
        </div>

        {/* Main Statistics */}
        <div className="mb-8">
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
        </div>

        {/* Users Status */}
        <div className="mb-8">
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
        </div>

        {/* Services Status */}
        <div className="mb-8">
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
        </div>

        {/* Demandes Status */}
        <div className="mb-8">
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
        </div>

        {/* Documents Status */}
        <div>
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
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
