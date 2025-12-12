import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { 
  Inbox, CheckCircle, XCircle, Clock, MapPin, User, 
  Calendar, MessageSquare, Star, Eye, Package
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

export default function MesDemandesPage() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/connexion');
      return;
    }
    
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/demandes');
      setDemandes(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold text-amber-900 mb-8">Mes Demandes</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {demandes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-12 text-center">
              <Inbox className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-700 mb-4">Vous n'avez pas encore de demandes.</p>
              <button
                onClick={() => navigate('/tous-services')}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700"
              >
                Rechercher un service
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {demandes.map((demande) => {
                const hasEvaluation = demande.evaluations?.some(e => e.cible === 'intervenant');
                return (
                  <div key={demande.id} className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-amber-900">{demande.service?.titre}</h3>
                          <StatutBadge statut={demande.statut} />
                        </div>
                        <div className="space-y-2 text-sm text-amber-700">
                          {demande.service?.intervenant && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Intervenant: {demande.service.intervenant.prenom} {demande.service.intervenant.nom}</span>
                            </div>
                          )}
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
                    
                    {demande.statut === 'termine' && !hasEvaluation && (
                      <div className="pt-4 border-t border-amber-100">
                        <button
                          onClick={() => navigate(`/evaluation/${demande.id}?cible=intervenant`)}
                          className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" /> Évaluer l'intervenant
                        </button>
                      </div>
                    )}
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

