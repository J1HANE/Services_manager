import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterButtons from '../../components/admin/FilterButtons';
import { Archive, PackageCheck, Eye, MapPin, Star, User } from 'lucide-react';

const StatusBadge = ({ status, estActif }) => {
  if (status === 'archive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        <Archive className="w-3.5 h-3.5" /> Archivé
      </span>
    );
  }
  if (estActif) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <PackageCheck className="w-3.5 h-3.5" /> Actif
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Inactif
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const colors = {
    electricite: 'bg-yellow-100 text-yellow-700',
    peinture: 'bg-blue-100 text-blue-700',
    menuiserie: 'bg-amber-100 text-amber-700',
  };
  const labels = {
    electricite: 'Électricité',
    peinture: 'Peinture',
    menuiserie: 'Menuiserie',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[type] || 'bg-slate-100 text-slate-700'}`}>
      {labels[type] || type}
    </span>
  );
};

export default function AdminServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: searchParams.get('statut') || '',
    type_service: searchParams.get('type_service') || '',
  });
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type_service) params.append('type_service', filters.type_service);
      
      const res = await API.get(`/admin/services?${params.toString()}`);
      let data = res.data?.data || res.data || [];
      
      // Client-side search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(s => 
          s.titre?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term) ||
          s.ville?.toLowerCase().includes(term) ||
          s.intervenant?.nom?.toLowerCase().includes(term) ||
          s.intervenant?.prenom?.toLowerCase().includes(term)
        );
      }
      
      setServices(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleArchive = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await API.patch(`/admin/services/${id}/archive`);
      setActionSuccess('Service archivé avec succès');
      fetchServices();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const handleActivate = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await API.patch(`/admin/services/${id}/activate`);
      setActionSuccess('Service activé avec succès');
      fetchServices();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await API.patch(`/admin/services/${id}/toggle-status`);
      setActionSuccess('Statut modifié avec succès');
      fetchServices();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action impossible');
      setTimeout(() => setActionError(''), 5000);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.statut) params.set('statut', newFilters.statut);
    if (newFilters.type_service) params.set('type_service', newFilters.type_service);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFilters({ statut: '', type_service: '' });
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Services">
        {/* Filters */}
        <FilterButtons
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          filterOptions={{
            statuts: [
              { value: 'actif', label: 'Actifs' },
              { value: 'archive', label: 'Archivés' }
            ],
            types: [
              { value: 'electricite', label: 'Électricité' },
              { value: 'peinture', label: 'Peinture' },
              { value: 'menuiserie', label: 'Menuiserie' }
            ]
          }}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par titre, description, ville ou intervenant..."
        />

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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Intervenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Localisation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{s.titre}</div>
                        {s.description && (
                          <div className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description.substring(0, 100)}...</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TypeBadge type={s.type_service} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <div className="text-sm text-slate-700">
                            {s.intervenant?.prenom} {s.intervenant?.nom}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{s.intervenant?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {s.ville || '--'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium text-slate-900">
                            {s.moyenne_note ? (s.moyenne_note / 10).toFixed(1) : '0.0'}
                          </span>
                          <span className="text-xs text-slate-500">({s.nb_avis || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={s.statut} estActif={s.est_actif} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedService(s)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {s.statut === 'archive' ? (
                            <button
                              onClick={() => handleActivate(s.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Activer"
                            >
                              <PackageCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(s.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && services.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                        Aucun service trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {services.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Affichage de <strong>{services.length}</strong> service{services.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedService(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">{selectedService.titre}</h3>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">Description</div>
                  <div className="text-slate-600">{selectedService.description || 'Aucune description'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Type</div>
                    <TypeBadge type={selectedService.type_service} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Statut</div>
                    <StatusBadge status={selectedService.statut} estActif={selectedService.est_actif} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">Intervenant</div>
                  <div className="text-slate-600">
                    {selectedService.intervenant?.prenom} {selectedService.intervenant?.nom} ({selectedService.intervenant?.email})
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-1">Localisation</div>
                  <div className="text-slate-600">{selectedService.ville || 'Non spécifiée'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Note moyenne</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-bold text-slate-900">
                        {selectedService.moyenne_note ? (selectedService.moyenne_note / 10).toFixed(1) : '0.0'}
                      </span>
                      <span className="text-sm text-slate-500">({selectedService.nb_avis || 0} avis)</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Date de création</div>
                    <div className="text-slate-600">
                      {new Date(selectedService.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Fermer
                </button>
                {selectedService.statut === 'archive' ? (
                  <button
                    onClick={() => {
                      handleActivate(selectedService.id);
                      setSelectedService(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Activer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleArchive(selectedService.id);
                      setSelectedService(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700"
                  >
                    Archiver
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}

