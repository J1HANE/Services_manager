import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterButtons from '../../components/admin/FilterButtons';
import { 
  Inbox, Eye, MapPin, Calendar, 
  DollarSign, User, Package, Clock, CheckCircle, 
  XCircle, MessageSquare, Loader
} from 'lucide-react';

const StatutBadge = ({ statut }) => {
  const badges = {
    en_attente: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente', icon: Clock },
    en_discussion: { color: 'bg-blue-100 text-blue-700', label: 'En discussion', icon: MessageSquare },
    accepte: { color: 'bg-green-100 text-green-700', label: 'Acceptée', icon: CheckCircle },
    refuse: { color: 'bg-red-100 text-red-700', label: 'Refusée', icon: XCircle },
    termine: { color: 'bg-purple-100 text-purple-700', label: 'Terminée', icon: CheckCircle },
  };
  
  const badge = badges[statut] || badges.en_attente;
  const Icon = badge.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {badge.label}
    </span>
  );
};

const TypeDemandeBadge = ({ type }) => {
  const colors = {
    libre: 'bg-indigo-100 text-indigo-700',
    categories: 'bg-pink-100 text-pink-700',
  };
  const labels = {
    libre: 'Libre',
    categories: 'Par catégories',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[type] || 'bg-slate-100 text-slate-700'}`}>
      {labels[type] || type}
    </span>
  );
};

const TypeServiceBadge = ({ type }) => {
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

export default function AdminDemandesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: searchParams.get('statut') || '',
    type_demande: searchParams.get('type_demande') || '',
    type_service: searchParams.get('type_service') || '',
    ville: searchParams.get('ville') || '',
  });
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchDemandes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type_demande) params.append('type_demande', filters.type_demande);
      if (filters.type_service) params.append('type_service', filters.type_service);
      if (filters.ville) params.append('ville', filters.ville);
      
      const res = await API.get(`/admin/demandes?${params.toString()}`);
      let data = res.data?.data || res.data || [];
      
      // Client-side search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(d => 
          d.client?.nom?.toLowerCase().includes(term) ||
          d.client?.prenom?.toLowerCase().includes(term) ||
          d.client?.email?.toLowerCase().includes(term) ||
          d.service?.titre?.toLowerCase().includes(term) ||
          d.adresse?.toLowerCase().includes(term) ||
          d.ville?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term)
        );
      }
      
      setDemandes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/demandes/stats');
      setStats(res.data?.data || res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchDemandes();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDemandes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewDetails = async (demandeId) => {
    setLoadingDetails(true);
    try {
      const res = await API.get(`/admin/demandes/${demandeId}`);
      setSelectedDemande(res.data?.data || res.data);
    } catch (err) {
      console.error('Error fetching demande details:', err);
      alert('Erreur lors du chargement des détails');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.statut) params.set('statut', newFilters.statut);
    if (newFilters.type_demande) params.set('type_demande', newFilters.type_demande);
    if (newFilters.type_service) params.set('type_service', newFilters.type_service);
    if (newFilters.ville) params.set('ville', newFilters.ville);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFilters({ statut: '', type_demande: '', type_service: '', ville: '' });
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Demandes">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Total Demandes</div>
                  <div className="text-3xl font-bold text-slate-900">{stats.total || 0}</div>
                </div>
                <Inbox className="w-10 h-10 text-amber-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">En Attente</div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.par_statut?.en_attente || 0}</div>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Acceptées</div>
                  <div className="text-3xl font-bold text-green-600">{stats.par_statut?.accepte || 0}</div>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Montant Total</div>
                  <div className="text-3xl font-bold text-slate-900">{stats.montant_total?.toFixed(2) || '0.00'} DH</div>
                </div>
                <DollarSign className="w-10 h-10 text-amber-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterButtons
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          filterOptions={{
            statuts: [
              { value: 'en_attente', label: 'En attente' },
              { value: 'en_discussion', label: 'En discussion' },
              { value: 'accepte', label: 'Acceptée' },
              { value: 'refuse', label: 'Refusée' },
              { value: 'termine', label: 'Terminée' }
            ],
            types: [
              { value: 'libre', label: 'Libre' },
              { value: 'categories', label: 'Par catégories' }
            ],
            typeServices: [
              { value: 'electricite', label: 'Électricité' },
              { value: 'peinture', label: 'Peinture' },
              { value: 'menuiserie', label: 'Menuiserie' }
            ]
          }}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher (client, service, adresse...)"
        />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Localisation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {demandes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">#{d.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {d.client?.prenom} {d.client?.nom}
                            </div>
                            <div className="text-xs text-slate-500">{d.client?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{d.service?.titre || '--'}</div>
                        {d.service?.type_service && (
                          <TypeServiceBadge type={d.service.type_service} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TypeDemandeBadge type={d.type_demande} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <div>
                            <div>{d.ville || '--'}</div>
                            <div className="text-xs text-slate-500">{d.adresse?.substring(0, 30)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {d.prix_total ? (
                          <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                            <DollarSign className="w-4 h-4" />
                            {parseFloat(d.prix_total).toFixed(2)} DH
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatutBadge statut={d.statut} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(d.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(d.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && demandes.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-sm text-slate-500">
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {demandes.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Affichage de <strong>{demandes.length}</strong> demande{demandes.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Demande Details Modal */}
        {selectedDemande && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDemande(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Détails de la demande #{selectedDemande.id}</h3>
                  <button
                    onClick={() => setSelectedDemande(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              {loadingDetails ? (
                <div className="p-12 text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <div className="text-slate-600">Chargement des détails...</div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Client Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Client</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {selectedDemande.client?.prenom} {selectedDemande.client?.nom}
                          </div>
                          <div className="text-sm text-slate-600">{selectedDemande.client?.email}</div>
                          {selectedDemande.client?.telephone && (
                            <div className="text-sm text-slate-600">{selectedDemande.client.telephone}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Service</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="font-medium text-slate-900 mb-2">{selectedDemande.service?.titre}</div>
                      {selectedDemande.service?.type_service && (
                        <TypeServiceBadge type={selectedDemande.service.type_service} />
                      )}
                      {selectedDemande.service?.intervenant && (
                        <div className="mt-2 text-sm text-slate-600">
                          Intervenant: {selectedDemande.service.intervenant.prenom} {selectedDemande.service.intervenant.nom}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Demande Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Informations de la demande</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Type:</span>
                        <TypeDemandeBadge type={selectedDemande.type_demande} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Statut:</span>
                        <StatutBadge statut={selectedDemande.statut} />
                      </div>
                      {selectedDemande.prix_total && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Prix total:</span>
                          <span className="font-medium text-green-700">{parseFloat(selectedDemande.prix_total).toFixed(2)} DH</span>
                        </div>
                      )}
                      {selectedDemande.date_souhaitee && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Date souhaitée:</span>
                          <span className="text-sm text-slate-900">
                            {new Date(selectedDemande.date_souhaitee).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedDemande.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Description</h4>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-700">{selectedDemande.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Localisation */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Localisation</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedDemande.adresse}, {selectedDemande.ville}</span>
                      </div>
                      {selectedDemande.latitude && selectedDemande.longitude && (
                        <div className="text-xs text-slate-500">
                          Coordonnées: {selectedDemande.latitude}, {selectedDemande.longitude}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Catégories (si type = categories) */}
                  {selectedDemande.type_demande === 'categories' && selectedDemande.parametres_demande?.categories && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Catégories sélectionnées</h4>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {selectedDemande.parametres_demande.categories.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-slate-700">Catégorie #{cat.category_id}</span>
                              <span className="text-slate-600">
                                Quantité: {cat.quantity} × {cat.prix} DH = {(cat.quantity * cat.prix).toFixed(2)} DH
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evaluations */}
                  {selectedDemande.evaluations && selectedDemande.evaluations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Évaluations ({selectedDemande.evaluations.length})</h4>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        {selectedDemande.evaluations.map((evaluation, idx) => (
                          <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-900">
                                Évaluation {evaluation.cible === 'intervenant' ? "de l'intervenant" : 'du client'}
                              </span>
                              <span className="text-sm text-slate-600">
                                Note: {evaluation.note_moyenne}/5
                              </span>
                            </div>
                            {evaluation.commentaire && (
                              <p className="text-sm text-slate-600">{evaluation.commentaire}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Dates</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Créée le:</span>
                        <span className="text-slate-900">
                          {new Date(selectedDemande.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Modifiée le:</span>
                        <span className="text-slate-900">
                          {new Date(selectedDemande.updated_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}

