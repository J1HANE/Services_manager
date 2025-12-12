import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterButtons from '../../components/admin/FilterButtons';
import { Star, Eye, User, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';

const CibleBadge = ({ cible }) => {
  if (cible === 'client') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <User className="w-3.5 h-3.5" /> Client
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <Briefcase className="w-3.5 h-3.5" /> Intervenant
    </span>
  );
};

const NoteDisplay = ({ note, maxNote = 5 }) => {
  const filledStars = Math.round((note / maxNote) * 5);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < filledStars
              ? 'text-amber-500 fill-amber-500'
              : 'text-slate-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-slate-700">{note.toFixed(1)}</span>
    </div>
  );
};

export default function AdminEvaluationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cible: searchParams.get('cible') || '',
  });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.cible) params.append('cible', filters.cible);
      
      const res = await API.get(`/admin/evaluations?${params.toString()}`);
      let data = res.data?.data || res.data || [];
      
      // Client-side search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(e => 
          e.demande?.client?.nom?.toLowerCase().includes(term) ||
          e.demande?.client?.prenom?.toLowerCase().includes(term) ||
          e.demande?.client?.email?.toLowerCase().includes(term) ||
          e.demande?.service?.intervenant?.nom?.toLowerCase().includes(term) ||
          e.demande?.service?.intervenant?.prenom?.toLowerCase().includes(term) ||
          e.commentaire?.toLowerCase().includes(term)
        );
      }
      
      setEvaluations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des évaluations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/evaluations/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  useEffect(() => {
    fetchEvaluations();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvaluations();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.cible) params.set('cible', newFilters.cible);
    setSearchParams(params);
  };

  const handleReset = () => {
    setFilters({ cible: '' });
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <AdminGuard>
      <AdminLayout title="Vérification des Évaluations">
        {/* Statistics Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 mb-2">Total Évaluations</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 mb-2">Pour Clients</div>
              <div className="text-3xl font-bold text-blue-600">{stats.pour_clients}</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 mb-2">Pour Intervenants</div>
              <div className="text-3xl font-bold text-green-600">{stats.pour_intervenants}</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 mb-2">Note Moyenne</div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <span className="text-3xl font-bold text-slate-900">{stats.moyenne_generale.toFixed(1)}</span>
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
            types: [
              { value: 'client', label: 'Pour Clients' },
              { value: 'intervenant', label: 'Pour Intervenants' }
            ]
          }}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par client, intervenant ou commentaire..."
        />

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cible</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Intervenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Note Moyenne</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Détails</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {evaluations.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CibleBadge cible={e.cible} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {e.demande?.client?.prenom} {e.demande?.client?.nom}
                        </div>
                        <div className="text-xs text-slate-500">{e.demande?.client?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {e.demande?.service?.intervenant?.prenom} {e.demande?.service?.intervenant?.nom}
                        </div>
                        <div className="text-xs text-slate-500">{e.demande?.service?.intervenant?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{e.demande?.service?.titre || '--'}</div>
                        <div className="text-xs text-slate-500">{e.demande?.statut}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <NoteDisplay note={parseFloat(e.note_moyenne) || 0} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 space-y-1">
                          <div>Ponctualité: {e.note_ponctualite}/5</div>
                          <div>Propreté: {e.note_proprete}/5</div>
                          <div>Qualité: {e.note_qualite}/5</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(e.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedEvaluation(e)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && evaluations.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                        Aucune évaluation trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {evaluations.length > 0 && (
          <div className="mt-4 text-sm text-slate-600">
            Affichage de <strong>{evaluations.length}</strong> évaluation{evaluations.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Evaluation Details Modal */}
        {selectedEvaluation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvaluation(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Détails de l'Évaluation</h3>
                  <button
                    onClick={() => setSelectedEvaluation(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Cible</div>
                  <CibleBadge cible={selectedEvaluation.cible} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">Client</div>
                    <div className="text-slate-900">
                      {selectedEvaluation.demande?.client?.prenom} {selectedEvaluation.demande?.client?.nom}
                    </div>
                    <div className="text-sm text-slate-500">{selectedEvaluation.demande?.client?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">Intervenant</div>
                    <div className="text-slate-900">
                      {selectedEvaluation.demande?.service?.intervenant?.prenom} {selectedEvaluation.demande?.service?.intervenant?.nom}
                    </div>
                    <div className="text-sm text-slate-500">{selectedEvaluation.demande?.service?.intervenant?.email}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Service</div>
                  <div className="text-slate-900">{selectedEvaluation.demande?.service?.titre}</div>
                  <div className="text-sm text-slate-500">Statut: {selectedEvaluation.demande?.statut}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-3">Notes</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Note moyenne</span>
                      <NoteDisplay note={parseFloat(selectedEvaluation.note_moyenne) || 0} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Ponctualité</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedEvaluation.note_ponctualite
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{selectedEvaluation.note_ponctualite}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Propreté</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedEvaluation.note_proprete
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{selectedEvaluation.note_proprete}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Qualité</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedEvaluation.note_qualite
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">{selectedEvaluation.note_qualite}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEvaluation.commentaire && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Commentaire
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-slate-700">
                      {selectedEvaluation.commentaire}
                    </div>
                  </div>
                )}

                <div className="text-sm text-slate-500">
                  Date: {new Date(selectedEvaluation.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}

