// src/pages/ServiceWizardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import {
  Hammer, MapPin, Info, Euro, CheckCircle, ArrowRight,
  ArrowLeft, Paintbrush, Zap, Clock, Home
} from 'lucide-react';
import { fetchCategories, createService } from '../lib/api/services';

// Remplacez l'import de toast (sonner@2.0.3 n'existe pas en npm)
// Utilisez un toast simple ou installez 'sonner'
const toast = {
  error: (msg) => alert(`❌ ${msg}`),
  success: (msg) => alert(`✅ ${msg}`)
};

function ServiceWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Vous devez être connecté pour créer un service');
      navigate('/login');
    }
  }, [navigate]);

  // Current user metiers (used to filter allowed service categories)
  const [userMetiers, setUserMetiers] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch current authenticated user to know which métiers are allowed
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;
        const result = await res.json();
        const user = result.user || result;

        let metiers = [];
        if (user.metiers && Array.isArray(user.metiers)) {
          metiers = user.metiers.map(m => (typeof m === 'string' ? m : m.code || '')) .filter(Boolean);
        } else if (user.metier) {
          metiers = typeof user.metier === 'string' ? [user.metier] : [];
        } else if (user.principal_metier) {
          metiers = [user.principal_metier];
        }

        setUserMetiers(metiers);
      } catch (error) {
        console.error('Failed to fetch current user', error);
      }
    };

    fetchMe();
  }, []);

  // Étape 1: Informations de base
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    ville: '',
    adresse: '',
    latitude: '',
    longitude: '',
    image_principale: null,
    images_supplementaires: [],
  });

  // Availability days (1=Monday, 7=Sunday)
  const [disponibilites, setDisponibilites] = useState([]);

  // Étape 2: Catégorie et type de service
  const [categorie, setCategorie] = useState('');
  const [specificFields, setSpecificFields] = useState({
    // Menuisier
    typeBois: '',
    finitions: [],
    // Peintre
    typesPeinture: [],
    surfaces: [],
    // Électricien
    typesTravaux: [],
  });

  // Étape 3: Catégories et tarifs
  const [categoriesPrices, setCategoriesPrices] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'menuisier', label: 'Menuisier', icon: Hammer, color: 'amber' },
    { value: 'peintre', label: 'Peintre', icon: Paintbrush, color: 'orange' },
    { value: 'electricien', label: 'Électricien', icon: Zap, color: 'green' },
  ];

  // Options spécifiques pour chaque catégorie
  const typesBoiss = ['Chêne', 'Pin', 'Hêtre', 'Noyer', 'Érable', 'Acajou', 'Bois exotiques', 'Contreplaqué', 'MDF'];
  const finitionsMenuiserie = ['Brut', 'Vernis', 'Lasure', 'Peinture', 'Huile', 'Cire', 'Laqué'];
  const typesPeinture = ['Acrylique', 'Glycéro', 'Écologique', 'Satinée', 'Mate', 'Brillante', 'Antirouille', 'Hydrofuge'];
  const surfacesPeinture = ['Intérieur résidentiel', 'Extérieur résidentiel', 'Locaux commerciaux', 'Bureaux', 'Façades', 'Plafonds', 'Boiseries', 'Métaux'];
  const typesTravauxElec = ['Installation neuve', 'Rénovation', 'Mise aux normes', 'Dépannage', 'Maintenance', 'Domotique', 'Éclairage', 'Chauffage électrique'];


  // Initialiser les catégories de prix selon le métier
  const initCategoriesPrices = (cat) => {
    if (cat === 'menuisier') {
      return [
        { categorie: 'Fabrication de meubles sur mesure', prix: '350', unite: '€/jour', selected: false },
        { categorie: 'Installation de placards', prix: '45', unite: '€/m²', selected: false },
        { categorie: 'Pose de portes intérieures', prix: '120', unite: '€/unité', selected: false },
        { categorie: 'Pose de portes extérieures', prix: '250', unite: '€/unité', selected: false },
        { categorie: 'Installation de fenêtres', prix: '180', unite: '€/unité', selected: false },
        { categorie: 'Pose de parquet', prix: '35', unite: '€/m²', selected: false },
        { categorie: 'Construction de terrasse bois', prix: '75', unite: '€/m²', selected: false },
        { categorie: 'Rénovation de meubles', prix: '40', unite: '€/heure', selected: false },
        { categorie: 'Escaliers sur mesure', prix: '500', unite: '€/jour', selected: false },
      ];
    } else if (cat === 'peintre') {
      return [
        { categorie: 'Peinture intérieure - murs et plafonds', prix: '25', unite: '€/m²', selected: false },
        { categorie: 'Peinture extérieure - façade', prix: '35', unite: '€/m²', selected: false },
        { categorie: 'Peinture de portes et fenêtres', prix: '80', unite: '€/unité', selected: false },
        { categorie: 'Peinture décorative (pochoirs, motifs)', prix: '45', unite: '€/m²', selected: false },
        { categorie: 'Peinture de sols (garage, terrasse)', prix: '30', unite: '€/m²', selected: false },
        { categorie: 'Lasure et traitement du bois', prix: '28', unite: '€/m²', selected: false },
        { categorie: 'Enduit et préparation des surfaces', prix: '20', unite: '€/m²', selected: false },
        { categorie: 'Papier peint - pose', prix: '35', unite: '€/m²', selected: false },
        { categorie: 'Ravalement de façade complet', prix: '400', unite: '€/jour', selected: false },
      ];
    } else {
      return [
        { categorie: 'Installation électrique complète', prix: '400', unite: '€/jour', selected: false },
        { categorie: 'Mise aux normes électriques', prix: '350', unite: '€/jour', selected: false },
        { categorie: 'Installation de prises et interrupteurs', prix: '45', unite: '€/unité', selected: false },
        { categorie: 'Installation d\'éclairage', prix: '60', unite: '€/point', selected: false },
        { categorie: 'Installation de tableau électrique', prix: '500', unite: '€/unité', selected: false },
        { categorie: 'Dépannage électrique', prix: '80', unite: '€/heure', selected: false },
        { categorie: 'Installation de chauffage électrique', prix: '200', unite: '€/radiateur', selected: false },
        { categorie: 'Installation de VMC', prix: '450', unite: '€/unité', selected: false },
        { categorie: 'Installation de borne de recharge véhicule', prix: '800', unite: '€/unité', selected: false },
        { categorie: 'Domotique et automatisation', prix: '100', unite: '€/heure', selected: false },
      ];
    }
  };

  // Fetch categories from backend when service type changes
  useEffect(() => {
    if (categorie) {
      const typeServiceMap = {
        'menuisier': 'menuiserie',
        'peintre': 'peinture',
        'electricien': 'electricite'
      };

      const fetchBackendCategories = async () => {
        setIsLoadingCategories(true);
        try {
          const categories = await fetchCategories({
            type_service: typeServiceMap[categorie]
          });
          setBackendCategories(categories);

          // Initialize categoriesPrices with backend categories
          const initialPrices = categories.map(cat => ({
            category_id: cat.id,
            categorie: cat.nom,
            type_categorie: cat.type_categorie,
            prix: '50',
            unite: 'MAD/heure',
            selected: false
          }));
          setCategoriesPrices(initialPrices);
        } catch (error) {
          console.error('Error fetching categories:', error);
          toast.error('Erreur lors du chargement des catégories');
          // Fallback to hardcoded categories
          setCategoriesPrices(initCategoriesPrices(categorie));
        } finally {
          setIsLoadingCategories(false);
        }
      };

      fetchBackendCategories();
    }
  }, [categorie]);

  const handleCategorieChange = (cat) => {
    setCategorie(cat);
  };

  const handleFinitionToggle = (finition) => {
    setSpecificFields(prev => ({
      ...prev,
      finitions: prev.finitions.includes(finition)
        ? prev.finitions.filter(f => f !== finition)
        : [...prev.finitions, finition]
    }));
  };

  const handleTypeToggle = (type, field) => {
    setSpecificFields(prev => ({
      ...prev,
      [field]: prev[field].includes(type)
        ? prev[field].filter(t => t !== type)
        : [...prev[field], type]
    }));
  };

  const handleCategorieToggle = (index) => {
    const newCategories = [...categoriesPrices];
    newCategories[index].selected = !newCategories[index].selected;
    setCategoriesPrices(newCategories);
  };

  const handlePriceChange = (index, field, value) => {
    const newCategories = [...categoriesPrices];
    newCategories[index][field] = value;
    setCategoriesPrices(newCategories);
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.titre || !formData.description || !formData.ville || !formData.adresse) {
        toast.error('Veuillez remplir tous les champs de l\'étape 1');
        return false;
      }
    } else if (step === 2) {
      if (!categorie) {
        toast.error('Veuillez sélectionner une catégorie');
        return false;
      }
      if (categorie === 'menuisier') {
        if (!specificFields.typeBois || specificFields.finitions.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques au menuisier');
          return false;
        }
      } else if (categorie === 'peintre') {
        if (specificFields.typesPeinture.length === 0 || specificFields.surfaces.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques au peintre');
          return false;
        }
      } else if (categorie === 'electricien') {
        if (specificFields.typesTravaux.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques à l\'électricien');
          return false;
        }
      }
    } else if (step === 3) {
      const selectedCategories = categoriesPrices.filter(c => c.selected);
      if (selectedCategories.length === 0) {
        toast.error('Veuillez sélectionner au moins une catégorie de service');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (userMetiers !== null && userMetiers.length === 0) {
      toast.error('Vous devez compléter votre profil (métiers) avant de publier un service');
      return;
    }

    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const selectedCategories = categoriesPrices.filter(c => c.selected);

      // Map frontend category to database enum
      const typeServiceMap = {
        'menuisier': 'menuiserie',
        'peintre': 'peinture',
        'electricien': 'electricite'
      };

      // Map price units to database enum
      const uniteMap = {
        'MAD/heure': 'par_heure',
        'MAD/m²': 'par_m2',
        'MAD/unité': 'par_unite',
        'MAD/jour': 'forfait',
        'MAD/point': 'par_unite',
        'MAD/radiateur': 'par_unite',
        'MAD/système': 'forfait',
        'MAD/projet': 'forfait',
        'MAD/service': 'par_service'
      };

      // Prepare service data for API (intervenant_id will be taken from authenticated user)
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('type_service', typeServiceMap[categorie]);
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('latitude', formData.latitude ? parseFloat(formData.latitude) : '');
      formDataToSend.append('longitude', formData.longitude ? parseFloat(formData.longitude) : '');
      formDataToSend.append('rayon_km', '20');

      // Add images
      if (formData.image_principale) {
        formDataToSend.append('image_principale', formData.image_principale);
      }

      if (formData.images_supplementaires && formData.images_supplementaires.length > 0) {
        formData.images_supplementaires.forEach((file, index) => {
          formDataToSend.append(`images_supplementaires[${index}]`, file);
        });
      }

      // Add availability days
      formDataToSend.append('disponibilites', JSON.stringify(disponibilites));

      // Add specific parameters
      formDataToSend.append('parametres_specifiques', JSON.stringify(specificFields));

      // Add categories with pricing
      const categoriesData = selectedCategories.map(cat => ({
        category_id: cat.category_id,
        prix: parseFloat(cat.prix),
        unite_prix: uniteMap[cat.unite] || 'par_heure'
      }));
      formDataToSend.append('categories', JSON.stringify(categoriesData));

      console.log('Submitting service data:', formDataToSend);

      const createdService = await createService(formDataToSend);

      console.log('Service created:', createdService);
      toast.success('Service publié avec succès !');

      // Redirect to home page after short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Erreur lors de la création du service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;
  const selectedCount = categoriesPrices.filter(c => c.selected).length;

  // Compute allowed categories based on authenticated user's métiers (if available)
  const allowedCategories = userMetiers === null
    ? categories
    : categories.filter(c => userMetiers.includes(c.value));

  const cannotProceed = userMetiers !== null && userMetiers.length === 0;

  // If user only has one metier, preselect it. If the currently selected category
  // is no longer allowed (e.g. user changed metiers), clear it.
  useEffect(() => {
    if (!userMetiers) return;
    if (userMetiers.length === 1 && !categorie) {
      setCategorie(userMetiers[0]);
    }
    if (categorie && userMetiers.length > 0 && !userMetiers.includes(categorie)) {
      setCategorie('');
    }
  }, [userMetiers, categorie]);

  const getCategoryColor = () => {
    const cat = allowedCategories.find(c => c.value === categorie) || categories.find(c => c.value === categorie);
    return cat ? cat.color : 'amber';
  };

  const colorClasses = {
    amber: {
      bg: 'bg-amber-600',
      border: 'border-amber-600',
      text: 'text-amber-900',
      hover: 'hover:border-amber-400',
      focus: 'focus:border-amber-600',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200',
    },
    orange: {
      bg: 'bg-orange-600',
      border: 'border-orange-600',
      text: 'text-amber-900',
      hover: 'hover:border-orange-400',
      focus: 'focus:border-orange-600',
      bgLight: 'bg-orange-50',
      borderLight: 'border-orange-200',
    },
    green: {
      bg: 'bg-green-700',
      border: 'border-green-600',
      text: 'text-amber-900',
      hover: 'hover:border-green-400',
      focus: 'focus:border-green-600',
      bgLight: 'bg-green-50',
      borderLight: 'border-green-200',
    },
  };

  const colors = colorClasses[getCategoryColor()];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-50 via-orange-50 to-green-50" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {categorie === 'menuisier' && <Hammer className="w-10 h-10 text-white" />}
                {categorie === 'peintre' && <Paintbrush className="w-10 h-10 text-white" />}
                {categorie === 'electricien' && <Zap className="w-10 h-10 text-white" />}
                {!categorie && <Info className="w-10 h-10 text-white" />}
              </div>
              <h1 className="text-4xl text-amber-900 mb-2">Publier un Service</h1>
              <p className="text-amber-700">Remplissez les informations pour créer votre offre de service</p>
            </div>

            {/* Barre de progression */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-800 font-semibold">Étape {currentStep} sur {totalSteps}</span>
                </div>
                <span className="text-sm text-amber-700">{Math.round(progress)}% complété</span>
              </div>

              {/* Barre de progression visuelle */}
              <div className="relative">
                <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Points d'étapes */}
                <div className="absolute top-0 left-0 w-full flex justify-between px-1 -mt-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${currentStep >= step
                        ? `${colors.bg} ${colors.border} text-white`
                        : 'bg-white border-amber-300 text-amber-600'
                        }`}
                    >
                      <span className="text-xs font-semibold">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labels des étapes */}
              <div className="flex justify-between mt-3 px-1">
                <span className={`text-xs ${currentStep >= 1 ? colors.text + ' font-semibold' : 'text-amber-600'}`}>
                  Informations
                </span>
                <span className={`text-xs ${currentStep >= 2 ? colors.text + ' font-semibold' : 'text-amber-600'}`}>
                  Catégorie
                </span>
                <span className={`text-xs ${currentStep >= 3 ? colors.text + ' font-semibold' : 'text-amber-600'}`}>
                  Tarifs
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              {/* Étape 1: Informations de base */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Info className="w-6 h-6 text-amber-700" />
                    <h2 className="text-2xl text-amber-900">Informations de base</h2>
                  </div>

                  <div>
                    <label className="block text-amber-900 mb-2 font-semibold">
                      Titre du service <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      placeholder="Ex: Installation de placards sur mesure"
                      className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-900 mb-2 font-semibold">
                      Description du service <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez votre service en détail..."
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder="Ex: Kenitra"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Adresse complète <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        placeholder="123 Rue de la République"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="Ex: 34.2610"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="Ex: -6.5802"
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4 mt-6 p-6 bg-amber-50 rounded-lg border-2 border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-4">Images du Service</h3>

                    {/* Main Image */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Image Principale
                      </label>

                      {formData.image_principale ? (
                        <div className="relative inline-block">
                          <img
                            src={URL.createObjectURL(formData.image_principale)}
                            alt="Aperçu"
                            className="w-48 h-48 object-cover rounded-lg border-2 border-amber-300"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_principale: null })}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, image_principale: e.target.files[0] })}
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors bg-white"
                          />
                          <p className="text-sm text-amber-700 mt-1">Photo principale de votre service</p>
                        </>
                      )}
                    </div>

                    {/* Additional Images */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">
                        Images Supplémentaires (optionnel)
                      </label>

                      {/* Preview Grid */}
                      {formData.images_supplementaires && formData.images_supplementaires.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {formData.images_supplementaires.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-amber-300"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images_supplementaires.filter((_, i) => i !== index);
                                  setFormData({ ...formData, images_supplementaires: newImages });
                                }}
                                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files);
                          const existingFiles = formData.images_supplementaires || [];
                          setFormData({ ...formData, images_supplementaires: [...existingFiles, ...newFiles] });
                        }}
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors bg-white"
                      />
                      <p className="text-sm text-amber-700 mt-1">
                        Ajoutez plusieurs photos de vos réalisations ({formData.images_supplementaires?.length || 0} image(s) sélectionnée(s))
                      </p>
                    </div>
                  </div>

                  {/* Availability Days Section */}
                  <div className="space-y-4 mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-4">Jours de Disponibilité</h3>
                    <p className="text-sm text-amber-700 mb-4">Sélectionnez les jours où vous êtes disponible</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { day: 1, label: 'Lundi' },
                        { day: 2, label: 'Mardi' },
                        { day: 3, label: 'Mercredi' },
                        { day: 4, label: 'Jeudi' },
                        { day: 5, label: 'Vendredi' },
                        { day: 6, label: 'Samedi' },
                        { day: 7, label: 'Dimanche' },
                      ].map(({ day, label }) => (
                        <label
                          key={day}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${disponibilites.includes(day)
                            ? 'bg-green-100 border-green-500 text-green-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={disponibilites.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDisponibilites([...disponibilites, day]);
                              } else {
                                setDisponibilites(disponibilites.filter(d => d !== day));
                              }
                            }}
                            className="w-5 h-5 text-green-600"
                          />
                          <span className="font-semibold">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Catégorie & type de service */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Hammer className="w-6 h-6 text-amber-700" />
                    <h2 className="text-2xl text-amber-900">Catégorie & Type de Service</h2>
                  </div>

                  {/* Sélection de la catégorie */}
                  <div>
                    <label className="block text-amber-900 mb-3 font-semibold">
                      Sélectionnez votre catégorie <span className="text-red-500">*</span>
                    </label>
                    {cannotProceed ? (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
                        <p className="font-semibold mb-2">Aucun métier associé à votre compte</p>
                        <p className="mb-3">Vous devez renseigner vos métiers dans votre profil avant de pouvoir publier un service.</p>
                        <Link to="/espace-pro" className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Compléter mon profil</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {allowedCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategorieChange(cat.value)}
                            className={`p-6 rounded-xl border-2 transition-all ${categorie === cat.value
                              ? `border-${cat.color}-600 bg-${cat.color}-50 shadow-lg`
                              : `border-amber-200 hover:border-${cat.color}-400`
                              }`}
                          >
                            <Icon className={`w-10 h-10 mx-auto mb-3 ${categorie === cat.value ? `text-${cat.color}-700` : 'text-amber-600'
                              }`} />
                            <div className="font-semibold text-amber-900">{cat.label}</div>
                          </button>
                        );
                      })}
                      </div>
                    )}
                  </div>

                  {/* Champs spécifiques selon la catégorie */}
                  {categorie === 'menuisier' && (
                    <div className="space-y-6 pt-6 border-t border-amber-200">
                      <h3 className="text-xl text-amber-900 font-semibold">Paramètres spécifiques - Menuisier</h3>

                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Type de bois principal <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={specificFields.typeBois}
                          onChange={(e) => setSpecificFields({ ...specificFields, typeBois: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                        >
                          <option value="">Sélectionnez un type de bois</option>
                          {typesBoiss.map(bois => (
                            <option key={bois} value={bois}>{bois}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Finitions proposées <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {finitionsMenuiserie.map((finition) => (
                            <button
                              key={finition}
                              type="button"
                              onClick={() => handleFinitionToggle(finition)}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${specificFields.finitions.includes(finition)
                                ? 'border-amber-600 bg-amber-50 text-amber-900'
                                : 'border-amber-200 hover:border-amber-400 text-amber-700'
                                }`}
                            >
                              {finition}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {categorie === 'peintre' && (
                    <div className="space-y-6 pt-6 border-t border-amber-200">
                      <h3 className="text-xl text-amber-900 font-semibold">Paramètres spécifiques - Peintre</h3>

                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Types de peinture maîtrisés <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {typesPeinture.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleTypeToggle(type, 'typesPeinture')}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${specificFields.typesPeinture.includes(type)
                                ? 'border-orange-600 bg-orange-50 text-amber-900'
                                : 'border-orange-200 hover:border-orange-400 text-amber-700'
                                }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Surfaces de spécialité <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {surfacesPeinture.map((surface) => (
                            <button
                              key={surface}
                              type="button"
                              onClick={() => handleTypeToggle(surface, 'surfaces')}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${specificFields.surfaces.includes(surface)
                                ? 'border-orange-600 bg-orange-50 text-amber-900'
                                : 'border-orange-200 hover:border-orange-400 text-amber-700'
                                }`}
                            >
                              {surface}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {categorie === 'electricien' && (
                    <div className="space-y-6 pt-6 border-t border-amber-200">
                      <h3 className="text-xl text-amber-900 font-semibold">Paramètres spécifiques - Électricien</h3>

                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Types de travaux proposés <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {typesTravauxElec.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleTypeToggle(type, 'typesTravaux')}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${specificFields.typesTravaux.includes(type)
                                ? 'border-green-600 bg-green-50 text-amber-900'
                                : 'border-green-200 hover:border-green-400 text-amber-700'
                                }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`${colors.bgLight} border-2 ${colors.borderLight} rounded-lg p-4`}>
                        <p className="text-sm text-amber-900">
                          <span className="font-semibold">Note :</span> Assurez-vous de posséder les certifications nécessaires (Qualifelec, habilitations électriques, etc.).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 3: Catégories et tarifs */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Euro className="w-6 h-6 text-amber-700" />
                    <h2 className="text-2xl text-amber-900">Catégories & Tarifs</h2>
                  </div>

                  <div className={`${colors.bgLight} border-2 ${colors.borderLight} rounded-lg p-4`}>
                    <p className="text-amber-900">
                      <span className="font-semibold">Sélectionnez les catégories que vous proposez.</span>
                      <br />
                      Les prix sont prédéfinis mais modifiables selon votre tarification.
                    </p>
                    {selectedCount > 0 && (
                      <p className="text-amber-700 mt-2 font-semibold">
                        {selectedCount} catégorie{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Group categories by type_categorie */}
                  {['service', 'materiel', 'autre'].map(typeCategorie => {
                    const categoriesOfType = categoriesPrices.filter(cat => cat.type_categorie === typeCategorie);
                    if (categoriesOfType.length === 0) return null;

                    const typeCategorieLabels = {
                      'service': 'Services',
                      'materiel': 'Matériel',
                      'autre': 'Autres'
                    };

                    return (
                      <div key={typeCategorie} className="space-y-3">
                        <h3 className="text-lg font-semibold text-amber-900 mt-6 mb-3 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors.bg}`}></div>
                          {typeCategorieLabels[typeCategorie]}
                        </h3>

                        {categoriesOfType.map((item, globalIndex) => {
                          const index = categoriesPrices.indexOf(item);
                          return (
                            <div
                              key={item.category_id}
                              className={`border-2 rounded-lg p-4 transition-all ${item.selected
                                ? `${colors.border} ${colors.bgLight}`
                                : `${colors.borderLight} ${colors.hover}`
                                }`}
                            >
                              <div className="flex items-start gap-4">
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={() => handleCategorieToggle(index)}
                                  className="mt-1 w-5 h-5 rounded border-amber-300 focus:ring-amber-500"
                                />

                                <div className="flex-1">
                                  <label className="font-semibold text-amber-900 cursor-pointer block mb-2">
                                    {item.categorie}
                                  </label>

                                  {item.selected ? (
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 max-w-xs">
                                        <label className="block text-xs text-amber-700 mb-1">Prix (MAD)</label>
                                        <input
                                          type="number"
                                          value={item.prix}
                                          onChange={(e) => handlePriceChange(index, 'prix', e.target.value)}
                                          className={`w-full px-3 py-2 border-2 ${colors.borderLight} rounded-lg focus:outline-none ${colors.focus}`}
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>
                                      <div className="flex-1 max-w-xs">
                                        <label className="block text-xs text-amber-700 mb-1">Unité</label>
                                        <select
                                          value={item.unite}
                                          onChange={(e) => handlePriceChange(index, 'unite', e.target.value)}
                                          className={`w-full px-3 py-2 border-2 ${colors.borderLight} rounded-lg focus:outline-none ${colors.focus}`}
                                        >
                                          <option value="MAD/heure">MAD/heure</option>
                                          <option value="MAD/jour">MAD/jour</option>
                                          <option value="MAD/m²">MAD/m²</option>
                                          <option value="MAD/unité">MAD/unité</option>
                                          <option value="MAD/point">MAD/point</option>
                                          <option value="MAD/radiateur">MAD/radiateur</option>
                                          <option value="MAD/système">MAD/système</option>
                                          <option value="MAD/projet">MAD/projet</option>
                                          <option value="MAD/service">MAD/service</option>
                                        </select>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-amber-600">
                                      Prix par défaut: <span className="font-semibold">{item.prix} {item.unite}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-amber-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex-1 px-6 py-4 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Précédent
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStep === 2 && cannotProceed}
                    className={`flex-1 px-6 py-4 ${colors.bg} text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || cannotProceed}
                    className={`flex-1 px-6 py-4 ${colors.bg} text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isSubmitting ? 'Publication en cours...' : 'Publier le Service'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ServiceWizardPage;