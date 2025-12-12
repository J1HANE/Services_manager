import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { 
  Package, Clock, CheckCircle, XCircle, 
  MapPin, Calendar, Loader, AlertCircle, ArrowLeft
} from 'lucide-react';

export default function MesDemandesPage() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'client') {
      navigate('/connexion');
      return;
    }
    
    fetchDemandes();
  }, [navigate]);

  const fetchDemandes = async () => {
    try {
      const res = await API.get('/demandes');
      setDemandes(res.data || []);
    } catch (err) {
      console.error('Error fetching demandes:', err);
      setError('Erreur lors du chargement de vos demandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      en_attente: { color: 'bg-yellow-100 text-yellow-700', label: 'En attente', icon: Clock },
      en_discussion: { color: 'bg-blue-100 text-blue-700', label: 'En discussion', icon: Clock },
      accepte: { color: 'bg-green-100 text-green-700', label: 'Acceptée', icon: CheckCircle },
      refuse: { color: 'bg-red-100 text-red-700', label: 'Refusée', icon: XCircle },
      termine: { color: 'bg-purple-100 text-purple-700', label: 'Terminée', icon: CheckCircle },
    };
    return badges[statut] || badges.en_attente;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <Loader className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <Header />
      <div className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <h1 className="text-4xl font-bold text-amber-900 mb-8">Mes Demandes</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {demandes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-12 text-center">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-700 mb-4">Vous n'avez pas encore de demandes.</p>
              <button
                onClick={() => navigate('/tous-services')}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700"
              >
                Parcourir les services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {demandes.map((demande) => {
                const badge = getStatutBadge(demande.statut);
                const Icon = badge.icon;
                
                return (
                  <div
                    key={demande.id}
                    className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-amber-900 mb-2">
                          {demande.service?.titre || 'Service'}
                        </h3>
                        {demande.service?.intervenant && (
                          <p className="text-amber-700 mb-2">
                            Intervenant: {demande.service.intervenant.prenom} {demande.service.intervenant.nom}
                          </p>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                    </div>

                    {demande.description && (
                      <p className="text-gray-600 mb-4">{demande.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <span>{demande.adresse}, {demande.ville}</span>
                      </div>
                      {demande.date_souhaitee && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-5 h-5 text-amber-600" />
                          <span>{new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {demande.prix_total && (
                        <div className="text-gray-700">
                          <span className="font-semibold">Prix: {parseFloat(demande.prix_total).toFixed(2)} DH</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
