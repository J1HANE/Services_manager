import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminLayout from '../../components/admin/AdminLayout';
import FilterButtons from '../../components/admin/FilterButtons';
import {
  AlertTriangle, CheckCircle, Clock, XCircle,
  MessageSquare, User, Calendar, ArrowRight, Eye, Send
} from 'lucide-react';

const StatusBadge = ({ statut }) => {
  const styles = {
    en_attente: 'bg-red-100 text-red-700 border-red-200',
    en_cours: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    resolue: 'bg-green-100 text-green-700 border-green-200',
    fermee: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels = {
    en_attente: 'En Attente',
    en_cours: 'En Cours',
    resolue: 'Résolue',
    fermee: 'Fermée',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[statut] || styles.en_attente}`}>
      {labels[statut] || statut}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      type === 'client' 
        ? 'bg-blue-100 text-blue-700' 
        : 'bg-purple-100 text-purple-700'
    }`}>
      {type === 'client' ? 'Client' : 'Intervenant'}
    </span>
  );
};

export default function AdminReclamationsPage() {
  const [reclamations, setReclamations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [filters, setFilters] = useState({
    statut: '',
    createur_type: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState('');
  const [responseStatut, setResponseStatut] = useState('resolue');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
  });

  useEffect(() => {
    fetchReclamations();
    fetchStats();
  }, [filters, searchTerm, pagination.current_page]);

  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        statut: filters.statut,
        createur_type: filters.createur_type,
        search: searchTerm,
      };
      const res = await API.get('/admin/reclamations', { params });
      
      // Laravel paginate retourne: { success: true, data: { data: [...], current_page, ... } }
      // Structure: res.data = { success: true, data: { data: [...], current_page: 1, ... } }
      const apiResponse = res.data;
      
      if (apiResponse?.success && apiResponse?.data) {
        const paginatedData = apiResponse.data;
        
        // Extraire le tableau de réclamations
        const reclamationsList = Array.isArray(paginatedData.data) 
          ? paginatedData.data 
          : [];
        
        setReclamations(reclamationsList);
        
        // Gestion de la pagination
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 15,
        });
      } else {
        // Fallback si la structure est différente
        const reclamationsList = Array.isArray(apiResponse?.data) 
          ? apiResponse.data 
          : (Array.isArray(apiResponse) ? apiResponse : []);
        setReclamations(reclamationsList);
      }
    } catch (err) {
      console.error('Error fetching reclamations:', err);
      setReclamations([]); // S'assurer que c'est toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/reclamations/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRespond = async () => {
    if (!response.trim() || !selectedReclamation) return;

    try {
      await API.post(`/admin/reclamations/${selectedReclamation.id}/repondre`, {
        reponse: response,
        statut: responseStatut,
      });
      setShowResponseModal(false);
      setResponse('');
      setSelectedReclamation(null);
      fetchReclamations();
      fetchStats();
    } catch (err) {
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await API.get(`/admin/reclamations/${id}`);
      setSelectedReclamation(res.data.data);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Gestion des Réclamations">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">Total</div>
                <div className="text-3xl font-bold text-slate-900">{stats?.total || 0}</div>
              </div>
              <AlertTriangle className="w-12 h-12 text-slate-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-red-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 mb-1">En Attente</div>
                <div className="text-3xl font-bold text-red-700">{stats?.en_attente || 0}</div>
              </div>
              <Clock className="w-12 h-12 text-red-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-600 mb-1">En Cours</div>
                <div className="text-3xl font-bold text-yellow-700">{stats?.en_cours || 0}</div>
              </div>
              <MessageSquare className="w-12 h-12 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-green-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 mb-1">Résolues</div>
                <div className="text-3xl font-bold text-green-700">{stats?.resolue || 0}</div>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <FilterButtons
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => {
            setFilters({ statut: '', createur_type: '' });
            setSearchTerm('');
          }}
          filterOptions={{
            statuts: [
              { value: 'en_attente', label: 'En Attente' },
              { value: 'en_cours', label: 'En Cours' },
              { value: 'resolue', label: 'Résolue' },
              { value: 'fermee', label: 'Fermée' }
            ],
            createurTypes: ['client', 'intervenant']
          }}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher..."
        />

        {/* Reclamations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {(!reclamations || !Array.isArray(reclamations) ? [] : reclamations).map((reclamation, index) => (
              <motion.div
                key={reclamation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{reclamation.sujet}</h3>
                      <StatusBadge statut={reclamation.statut} />
                      <TypeBadge type={reclamation.createur_type} />
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{reclamation.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {reclamation.createur?.nom} {reclamation.createur?.prenom}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(reclamation.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {reclamation.demande && (
                        <div className="flex items-center gap-2">
                          <span>Intervention #{reclamation.demande.id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(reclamation.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {reclamation.statut === 'en_attente' && (
                      <button
                        onClick={() => {
                          setSelectedReclamation(reclamation);
                          setShowResponseModal(true);
                        }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Répondre
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {reclamations.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Aucune réclamation trouvée
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2">
              Page {pagination.current_page} sur {pagination.last_page}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {showModal && selectedReclamation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Détails de la Réclamation</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Sujet</div>
                    <div className="text-lg font-semibold">{selectedReclamation.sujet}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Description</div>
                    <div className="text-slate-700">{selectedReclamation.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Créateur</div>
                      <div className="font-semibold">
                        {selectedReclamation.createur?.nom} {selectedReclamation.createur?.prenom}
                      </div>
                      <TypeBadge type={selectedReclamation.createur_type} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Statut</div>
                      <StatusBadge statut={selectedReclamation.statut} />
                    </div>
                  </div>
                  {selectedReclamation.reponse && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="text-sm text-amber-700 font-semibold mb-2">Réponse Admin</div>
                      <div className="text-amber-900">{selectedReclamation.reponse}</div>
                      {selectedReclamation.repondu_par && (
                        <div className="text-xs text-amber-600 mt-2">
                          Répondu par: {selectedReclamation.reponduPar?.email} le{' '}
                          {new Date(selectedReclamation.reponse_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response Modal */}
        <AnimatePresence>
          {showResponseModal && selectedReclamation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowResponseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full"
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Répondre à la Réclamation</h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Sujet</div>
                    <div className="font-semibold">{selectedReclamation.sujet}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Réponse
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Tapez votre réponse ici..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau Statut
                    </label>
                    <select
                      value={responseStatut}
                      onChange={(e) => setResponseStatut(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="en_cours">En Cours</option>
                      <option value="resolue">Résolue</option>
                      <option value="fermee">Fermée</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowResponseModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleRespond}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer la Réponse
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminLayout>
    </AdminGuard>
  );
}

