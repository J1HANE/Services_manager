import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { 
  Package, Inbox, CheckCircle, XCircle, Clock, MapPin, User, 
  Calendar, MessageSquare, Star, Eye, Archive, Power
} from 'lucide-react';

const StatutBadge = ({ statut }) => {
  const badges = {
    en_attente: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente', icon: Clock },
    accepte: { color: 'bg-blue-100 text-blue-700', label: 'Acceptée', icon: CheckCircle },
    refuse: { color: 'bg-red-100 text-red-700', label: 'Refusée', icon: XCircle },
    termine: { color: 'bg-green-100 text-green-700', label: 'Terminée', icon: CheckCircle },
    en_discussion: { color: 'bg-purple-100 text-purple-700', label: 'En discussion', icon: MessageSquare },
  };
  
  const badge = badges[statut] || badges.en_attente;
  const Icon = badge.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
      <Icon className="w-3.5 h-3.5" /> {badge.label}
    </span>
  );
};

export default function EspaceProPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('services'); // 'services' ou 'demandes'

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Current user:', user);
    if (!user || !user.id) {
      console.log('User not logged in, redirecting to login...');
      navigate('/connexion');
      return;
    }
    if (user.role !== 'intervenant') {
      console.log('User is not an intervenant, redirecting...');
      alert('Cette page est réservée aux intervenants.');
      navigate('/');
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching data for Espace Pro...');
      const [servicesRes, demandesRes] = await Promise.allSettled([
        API.get('/my-services'),
        API.get('/artisan/demandes'),
      ]);
      
      // Gérer les services
      if (servicesRes.status === 'fulfilled') {
        console.log('Services response:', servicesRes.value.data);
        setServices(servicesRes.value.data || []);
      } else {
        console.error('Error fetching services:', servicesRes.reason);
        setServices([]);
      }
      
      // Gérer les demandes
      if (demandesRes.status === 'fulfilled') {
        console.log('Demandes response:', demandesRes.value.data);
        setDemandes(demandesRes.value.data || []);
      } else {
        console.error('Error fetching demandes:', demandesRes.reason);
        const errorMsg = demandesRes.reason?.response?.data?.message || demandesRes.reason?.message || 'Erreur lors du chargement des demandes';
        // Ne pas bloquer toute la page si seulement les demandes échouent
        setDemandes([]);
        if (servicesRes.status !== 'fulfilled') {
          setError(errorMsg);
        } else {
          // Afficher un avertissement moins critique
          console.warn('Impossible de charger les demandes:', errorMsg);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDemande = async (id) => {
    try {
      await API.patch(`/missions/${id}/accept`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleRefuseDemande = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) return;
    try {
      await API.patch(`/missions/${id}/refuse`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du refus');
    }
  };

  const handleCompleteDemande = async (id) => {
    if (!confirm('Confirmer que la mission est terminée et le paiement reçu ?')) return;
    try {
      await API.patch(`/missions/${id}/complete`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la finalisation');
    }
  };

  const handleToggleService = async (id) => {
    try {
      await API.patch(`/services/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <div className="text-center text-amber-900">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <Header />
      <div className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-900 mb-8">Espace Professionnel</h1>
          
          {!loading && (
            <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-800">
              <strong>État:</strong> Services: {services.length} | Demandes: {demandes.length}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-amber-200">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'services'
                  ? 'text-amber-900 border-b-2 border-amber-600'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Mes Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('demandes')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'demandes'
                  ? 'text-amber-900 border-b-2 border-amber-600'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <Inbox className="w-5 h-5 inline mr-2" />
              Demandes Reçues ({demandes.length})
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <strong>Erreur:</strong> {error}
              <div className="mt-2 text-sm">Vérifiez la console du navigateur (F12) pour plus de détails.</div>
            </div>
          )}
          
          {!loading && !error && services.length === 0 && demandes.length === 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              <strong>Information:</strong> Aucune donnée disponible. Les données se chargeront une fois que vous aurez créé des services ou reçu des demandes.
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-amber-900">Mes Services</h2>
                <button
                  onClick={() => navigate('/publier-service')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-semibold"
                >
                  + Ajouter un Service
                </button>
              </div>

              {services.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-12 text-center">
                  <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-700 mb-4">Vous n'avez pas encore de services.</p>
                  <button
                    onClick={() => navigate('/publier-service')}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700"
                  >
                    Créer mon premier service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-amber-900 mb-2">{service.titre}</h3>
                          <div className="flex items-center gap-2 text-sm text-amber-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            {service.ville || 'Non spécifiée'}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-amber-600">
                              {service.demandes_count || 0} demande(s)
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>{service.moyenne_note ? (service.moyenne_note / 10).toFixed(1) : '0.0'}</span>
                              <span className="text-amber-600">({service.nb_avis || 0})</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleToggleService(service.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              service.est_actif
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title={service.est_actif ? 'Désactiver' : 'Activer'}
                          >
                            {service.est_actif ? <Power className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-amber-800 text-sm mb-4 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.statut === 'actif' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {service.statut === 'actif' ? 'Actif' : 'Archivé'}
                        </span>
                        <button
                          onClick={() => navigate(`/publier-service?edit=${service.id}`)}
                          className="text-sm text-amber-700 hover:text-amber-900 font-semibold"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Demandes Tab */}
          {activeTab === 'demandes' && (
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Demandes Reçues</h2>

              {demandes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-12 text-center">
                  <Inbox className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-700">Aucune demande reçue pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {demandes.map((demande) => (
                    <div key={demande.id} className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-amber-900">{demande.service?.titre}</h3>
                            <StatutBadge statut={demande.statut} />
                          </div>
                          <div className="space-y-2 text-sm text-amber-700">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{demande.client?.prenom} {demande.client?.nom}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{demande.ville}, {demande.adresse}</span>
                            </div>
                            {demande.date_souhaitee && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Date souhaitée: {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                            {demande.prix_total && (
                              <div className="font-semibold text-amber-900">
                                Prix: {demande.prix_total} MAD
                              </div>
                            )}
                          </div>
                          {demande.description && (
                            <p className="mt-3 text-amber-800 text-sm">{demande.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-amber-100">
                        {demande.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleAcceptDemande(demande.id)}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" /> Accepter
                            </button>
                            <button
                              onClick={() => handleRefuseDemande(demande.id)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" /> Refuser
                            </button>
                          </>
                        )}
                        {demande.statut === 'accepte' && (
                          <button
                            onClick={() => handleCompleteDemande(demande.id)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Marquer comme terminé
                          </button>
                        )}
                        {demande.statut === 'termine' && (
                          <button
                            onClick={() => navigate(`/evaluation/${demande.id}?cible=client`)}
                            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" /> Évaluer le client
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
