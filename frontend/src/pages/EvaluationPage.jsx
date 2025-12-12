import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { Star, MessageSquare, Send, ArrowLeft } from 'lucide-react';

export default function EvaluationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cible = searchParams.get('cible') || 'intervenant'; // 'client' ou 'intervenant'
  
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [notePonctualite, setNotePonctualite] = useState(0);
  const [noteProprete, setNoteProprete] = useState(0);
  const [noteQualite, setNoteQualite] = useState(0);
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/connexion');
      return;
    }
    
    // Récupérer les détails de la demande
    const fetchDemande = async () => {
      try {
        const res = await API.get(`/demandes/${id}`);
        
        // Vérifier que la demande a les relations nécessaires
        if (!res.data || !res.data.service || !res.data.client) {
          setError('Données de demande incomplètes. Impossible de charger l\'évaluation.');
          setLoading(false);
          return;
        }
        
        setDemande(res.data);
        
        // Vérifier si une évaluation existe déjà
        const existingEval = res.data.evaluations?.find(e => e.cible === cible);
        if (existingEval) {
          alert('Vous avez déjà évalué cette mission.');
          navigate('/espace-pro');
        }
      } catch (err) {
        console.error('Error fetching demande:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Erreur lors du chargement de la demande';
        setError(errorMsg);
        if (err.response?.status === 404) {
          setTimeout(() => navigate('/espace-pro'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchDemande();
    }
  }, [id, cible, navigate]);

  const handleStarClick = (setter, value) => {
    setter(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (notePonctualite === 0 || noteProprete === 0 || noteQualite === 0) {
      setError('Veuillez noter tous les critères');
      setSubmitting(false);
      return;
    }

    try {
      await API.post('/reviews', {
        demande_id: parseInt(id),
        cible: cible,
        note_ponctualite: notePonctualite,
        note_proprete: noteProprete,
        note_qualite: noteQualite,
        commentaire: commentaire || null,
      });

      alert('Évaluation soumise avec succès !');
      navigate('/espace-pro');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-amber-900 mb-3">{label}</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 ${
                star <= value
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-amber-200 fill-amber-200'
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-4 text-lg font-semibold text-amber-900">{value}/5</span>
        )}
      </div>
    </div>
  );

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

  if (!demande && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Demande non trouvée'}</p>
            <button
              onClick={() => navigate('/espace-pro')}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Retour à l'espace pro
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <Header />
      <div className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          {demande && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Service:</strong> {demande.service?.titre}
                {cible === 'intervenant' && demande.service?.intervenant && (
                  <> - <strong>Intervenant:</strong> {demande.service.intervenant.prenom} {demande.service.intervenant.nom}</>
                )}
                {cible === 'client' && demande.client && (
                  <> - <strong>Client:</strong> {demande.client.prenom} {demande.client.nom}</>
                )}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
            <div className="mb-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">Évaluer {cible === 'intervenant' ? "l'intervenant" : 'le client'}</h1>
              <p className="text-amber-700">Partagez votre expérience pour aider la communauté</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <StarRating
                value={notePonctualite}
                onChange={setNotePonctualite}
                label="Ponctualité"
              />

              <StarRating
                value={noteProprete}
                onChange={setNoteProprete}
                label="Propreté"
              />

              <StarRating
                value={noteQualite}
                onChange={setNoteQualite}
                label="Qualité du travail"
              />

              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 resize-none"
                  placeholder="Décrivez votre expérience..."
                  maxLength={1000}
                />
                <div className="text-right text-xs text-amber-600 mt-1">
                  {commentaire.length}/1000 caractères
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || notePonctualite === 0 || noteProprete === 0 || noteQualite === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    'Envoi...'
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Soumettre l'évaluation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

