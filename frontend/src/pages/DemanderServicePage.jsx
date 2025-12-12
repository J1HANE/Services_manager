import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { 
  ArrowLeft, MapPin, Calendar, FileText, Package, 
  CheckCircle, XCircle, Loader, AlertCircle, DollarSign
} from 'lucide-react';

export default function DemanderServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [typeDemande, setTypeDemande] = useState('libre'); // 'libre' ou 'categories'
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [dateSouhaitee, setDateSouhaitee] = useState('');
  const [prixEstime, setPrixEstime] = useState('');
  const [selectedCategories, setSelectedCategories] = useState({}); // { categoryId: { quantity, prix, unite_prix } }
  
  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'client') {
      alert('Vous devez être connecté en tant que client pour faire une demande.');
      navigate('/connexion');
      return;
    }
    
    // Charger les détails du service
    const fetchService = async () => {
      try {
        const res = await API.get(`/search?service_id=${serviceId}`);
        if (res.data && res.data.data && res.data.data.length > 0) {
          setService(res.data.data[0]);
        } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setService(res.data[0]);
        } else {
          setError('Service non trouvé');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Erreur lors du chargement du service');
      } finally {
        setLoading(false);
      }
    };
    
    if (serviceId) {
      fetchService();
    }
  }, [serviceId, navigate]);
  
  // Calculer le prix total pour les catégories
  const calculatePrixTotal = () => {
    if (typeDemande === 'categories') {
      let total = 0;
      Object.values(selectedCategories).forEach(cat => {
        if (cat.quantity > 0) {
          total += parseFloat(cat.prix) * parseFloat(cat.quantity);
        }
      });
      return total.toFixed(2);
    }
    return prixEstime || '0';
  };
  
  // Gérer la sélection de catégories
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      const newState = { ...prev };
      if (newState[category.id]) {
        delete newState[category.id];
      } else {
        newState[category.id] = {
          quantity: 1,
          prix: category.prix,
          unite_prix: category.unite_prix,
          category_id: category.id
        };
      }
      return newState;
    });
  };
  
  const handleCategoryQuantityChange = (categoryId, quantity) => {
    setSelectedCategories(prev => {
      if (!prev[categoryId]) return prev;
      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          quantity: Math.max(1, parseInt(quantity) || 1)
        }
      };
    });
  };
  
  // Géolocalisation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        alert('Position récupérée avec succès !');
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Impossible de récupérer votre position');
      }
    );
  };
  
  // Validation du formulaire
  const validateForm = () => {
    if (!adresse.trim()) {
      setError('L\'adresse est requise');
      return false;
    }
    if (!ville.trim()) {
      setError('La ville est requise');
      return false;
    }
    if (typeDemande === 'libre' && !description.trim()) {
      setError('La description est requise pour une demande libre');
      return false;
    }
    if (typeDemande === 'categories' && Object.keys(selectedCategories).length === 0) {
      setError('Veuillez sélectionner au moins une catégorie');
      return false;
    }
    if (dateSouhaitee) {
      const selectedDate = new Date(dateSouhaitee);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        setError('La date souhaitée doit être postérieure à aujourd\'hui');
        return false;
      }
    }
    return true;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const prixTotal = typeDemande === 'categories' ? calculatePrixTotal() : prixEstime;
      
      const parametresDemande = typeDemande === 'categories' ? {
        categories: Object.values(selectedCategories).map(cat => ({
          category_id: cat.category_id,
          quantity: cat.quantity,
          prix: cat.prix,
          unite_prix: cat.unite_prix
        }))
      } : null;
      
      const demandeData = {
        service_id: parseInt(serviceId),
        type_demande: typeDemande,
        adresse: adresse.trim(),
        ville: ville.trim(),
        description: typeDemande === 'libre' ? description.trim() : null,
        date_souhaitee: dateSouhaitee || null,
        prix_total: prixTotal && parseFloat(prixTotal) > 0 ? parseFloat(prixTotal) : null,
        latitude: latitude || null,
        longitude: longitude || null,
        parametres_demande: parametresDemande ? JSON.stringify(parametresDemande) : null
      };
      
      const res = await API.post('/demandes', demandeData);
      
      alert('Demande créée avec succès !');
      navigate('/mes-demandes');
    } catch (err) {
      console.error('Error submitting demande:', err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       'Erreur lors de la création de la demande';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
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
  
  if (error && !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const categories = service?.categories || [];
  const prixTotal = calculatePrixTotal();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <Header />
      <div className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-2">Faire une demande</h1>
            {service && (
              <div className="flex items-center gap-2 text-amber-700">
                <Package className="w-5 h-5" />
                <span className="text-lg">{service.titre}</span>
                {service.intervenant && (
                  <span className="text-sm">- {service.intervenant.prenom} {service.intervenant.nom}</span>
                )}
              </div>
            )}
          </div>
          
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Type de demande */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-3">
                Type de demande <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-amber-50"
                  style={{ borderColor: typeDemande === 'libre' ? '#d97706' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="typeDemande"
                    value="libre"
                    checked={typeDemande === 'libre'}
                    onChange={(e) => setTypeDemande(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-amber-900">Demande libre</span>
                  <p className="text-sm text-gray-600 mt-1">Décrivez votre besoin en détail</p>
                </label>
                <label className="flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-amber-50"
                  style={{ borderColor: typeDemande === 'categories' ? '#d97706' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="typeDemande"
                    value="categories"
                    checked={typeDemande === 'categories'}
                    onChange={(e) => setTypeDemande(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-amber-900">Par catégories</span>
                  <p className="text-sm text-gray-600 mt-1">Sélectionnez les travaux souhaités</p>
                </label>
              </div>
            </div>
            
            {/* Description (si demande libre) */}
            {typeDemande === 'libre' && (
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 resize-none"
                  placeholder="Décrivez votre besoin en détail..."
                  maxLength={1000}
                  required
                />
                <div className="text-right text-xs text-amber-600 mt-1">
                  {description.length}/1000 caractères
                </div>
              </div>
            )}
            
            {/* Catégories (si demande par catégories) */}
            {typeDemande === 'categories' && (
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  Catégories de travaux <span className="text-red-500">*</span>
                </label>
                {categories.length === 0 ? (
                  <p className="text-gray-600 p-4 bg-gray-50 rounded-lg">
                    Aucune catégorie disponible pour ce service
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const isSelected = selectedCategories[category.id];
                      const uniteLabels = {
                        par_heure: 'par heure',
                        par_m2: 'par m²',
                        par_unite: 'par unité',
                        par_service: 'par service',
                        forfait: 'forfait'
                      };
                      
                      return (
                        <div
                          key={category.id}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            isSelected ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleCategoryToggle(category)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-amber-900">{category.nom || category.name}</span>
                                <span className="text-amber-700 font-semibold">
                                  {category.prix} DH {uniteLabels[category.unite_prix] || category.unite_prix}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="mt-3 flex items-center gap-3">
                                  <label className="text-sm text-gray-700">Quantité:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={selectedCategories[category.id]?.quantity || 1}
                                    onChange={(e) => handleCategoryQuantityChange(category.id, e.target.value)}
                                    className="w-24 px-3 py-1 border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
                                  />
                                  <span className="text-sm text-gray-600">
                                    = {(parseFloat(category.prix) * (selectedCategories[category.id]?.quantity || 1)).toFixed(2)} DH
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {Object.keys(selectedCategories).length > 0 && (
                  <div className="mt-4 p-4 bg-amber-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-900">Prix total estimé:</span>
                      <span className="text-2xl font-bold text-amber-900">{prixTotal} DH</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Prix estimé (si demande libre) */}
            {typeDemande === 'libre' && (
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Prix estimé (optionnel)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={prixEstime}
                    onChange={(e) => setPrixEstime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
            
            {/* Adresse */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                placeholder="Ex: 123 Rue Mohammed V"
                required
              />
            </div>
            
            {/* Ville */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                placeholder="Ex: Casablanca"
                required
              />
            </div>
            
            {/* Coordonnées GPS */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Coordonnées GPS (optionnel)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="any"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="any"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                  className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                  placeholder="Longitude"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Ma position
                </button>
              </div>
            </div>
            
            {/* Date souhaitée */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Date souhaitée (optionnel)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                <input
                  type="date"
                  value={dateSouhaitee}
                  onChange={(e) => setDateSouhaitee(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Demain
                  className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
            
            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

