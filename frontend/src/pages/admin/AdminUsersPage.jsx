import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, Shield, Search, Filter, X } from 'lucide-react';

const StatusBadge = ({ verified, banned }) => {
  if (banned) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="w-3.5 h-3.5" /> Banni
      </span>
    );
  }
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3.5 h-3.5" /> Vérifié
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
      Non vérifié
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const colors = {
    admin: 'bg-indigo-100 text-indigo-700',
    intervenant: 'bg-green-100 text-green-700',
    client: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors[role] || 'bg-slate-100 text-slate-700'}`}>
      {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
      {role}
    </span>
  );
};

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState(searchParams.get('role') || '');
  const [filterVerified, setFilterVerified] = useState(searchParams.get('est_verifie') || '');
  const [filterBanned, setFilterBanned] = useState(searchParams.get('is_banned') || '');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);
      if (filterVerified) params.append('est_verifie', filterVerified);
      if (filterBanned) params.append('is_banned', filterBanned);
      
      const res = await API.get(`/admin/users?${params.toString()}`);
      let data = res.data?.data || res.data || [];
      
      // Client-side search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(u => 
          u.nom?.toLowerCase().includes(term) ||
          u.prenom?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      }
      
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterVerified, filterBanned]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleBan = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await API.patch(`/admin/users/${id}/ban`);
      setActionSuccess('Statut de bannissement modifié avec succès');
      fetchUsers();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const handleToggleVerify = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await API.patch(`/admin/users/${id}/verify`);
      setActionSuccess('Statut de vérification modifié avec succès');
      fetchUsers();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const clearFilters = () => {
    setFilterRole('');
    setFilterVerified('');
    setFilterBanned('');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Utilisateurs">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setSearchParams({ ...Object.fromEntries(searchParams), role: e.target.value || undefined });
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="intervenant">Intervenant</option>
              <option value="client">Client</option>
            </select>

            <select
              value={filterVerified}
              onChange={(e) => {
                setFilterVerified(e.target.value);
                setSearchParams({ ...Object.fromEntries(searchParams), est_verifie: e.target.value || undefined });
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Vérifiés</option>
              <option value="false">Non vérifiés</option>
            </select>

            <select
              value={filterBanned}
              onChange={(e) => {
                setFilterBanned(e.target.value);
                setSearchParams({ ...Object.fromEntries(searchParams), is_banned: e.target.value || undefined });
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tous</option>
              <option value="true">Bannis</option>
              <option value="false">Actifs</option>
            </select>

            {(filterRole || filterVerified || filterBanned) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4" /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {actionSuccess}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Chargement...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Inscription</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{u.prenom} {u.nom}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge verified={u.est_verifie} banned={u.is_banned} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.telephone || '--'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleVerify(u.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                u.est_verifie
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                              title={u.est_verifie ? 'Retirer la vérification' : 'Vérifier'}
                            >
                              {u.est_verifie ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              disabled={isAdmin}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isAdmin
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : u.is_banned
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                              title={isAdmin ? 'Impossible de bannir un admin' : u.is_banned ? 'Réactiver' : 'Bannir'}
                            >
                              {u.is_banned ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {users.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Affichage de <strong>{users.length}</strong> utilisateur{users.length > 1 ? 's' : ''}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
