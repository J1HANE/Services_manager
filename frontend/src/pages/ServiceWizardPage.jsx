// src/pages/ServiceWizardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import {
  Hammer, MapPin, Info, Euro, CheckCircle, ArrowRight,
  ArrowLeft, Paintbrush, Zap, Clock, Home
} from 'lucide-react';
import { fetchSubServices, createService } from '../lib/api/services';

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

  // Sous-services (étape 2 dynamique)
  const [subServices, setSubServices] = useState([]);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState('');
  const [subServicePrice, setSubServicePrice] = useState('');
  const [subServiceUnit, setSubServiceUnit] = useState('MAD/heure');

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

  const [isLoadingSubServices, setIsLoadingSubServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 3: Options pricing (stored in parametres_specifiques.options_pricing)
  const [optionsPricing, setOptionsPricing] = useState(null);

  // Main service types (aligned with backend enum: menuiserie/peinture/electricite)
  const categories = [
    { value: 'menuiserie', label: 'Menuiserie', icon: Hammer, color: 'amber' },
    { value: 'peinture', label: 'Peinture', icon: Paintbrush, color: 'orange' },
    { value: 'electricite', label: 'Électricité', icon: Zap, color: 'green' },
  ];

  // User métiers are stored as codes like: menuisier/peintre/electricien.
  // We map them to backend service types.
  const metierToTypeService = {
    menuisier: 'menuiserie',
    peintre: 'peinture',
    electricien: 'electricite',
    // If backend already returns type_service values, keep them working
    menuiserie: 'menuiserie',
    peinture: 'peinture',
    electricite: 'electricite',
  };

  // Options spécifiques pour chaque catégorie
  const typesBoiss = ['Chêne', 'Pin', 'Hêtre', 'Noyer', 'Érable', 'Acajou', 'Bois exotiques', 'Contreplaqué', 'MDF'];
  const finitionsMenuiserie = ['Brut', 'Vernis', 'Lasure', 'Peinture', 'Huile', 'Cire', 'Laqué'];
  const typesPeinture = ['Acrylique', 'Glycéro', 'Écologique', 'Satinée', 'Mate', 'Brillante', 'Antirouille', 'Hydrofuge'];
  const surfacesPeinture = ['Intérieur résidentiel', 'Extérieur résidentiel', 'Locaux commerciaux', 'Bureaux', 'Façades', 'Plafonds', 'Boiseries', 'Métaux'];
  const typesTravauxElec = ['Installation neuve', 'Rénovation', 'Mise aux normes', 'Dépannage', 'Maintenance', 'Domotique', 'Éclairage', 'Chauffage électrique'];

  const buildDefaultOptionsPricing = (type) => {
    if (type === 'menuiserie') {
      const defaultBoisPrix = {
        'Chêne': 250,
        'Pin': 120,
        'Hêtre': 200,
        'Noyer': 320,
        'Érable': 220,
        'Acajou': 350,
        'Bois exotiques': 300,
        'Contreplaqué': 110,
        'MDF': 90,
      };
      const defaultFinitionsPrix = {
        'Brut': 0,
        'Vernis': 80,
        'Lasure': 70,
        'Peinture': 90,
        'Huile': 60,
        'Cire': 60,
        'Laqué': 120,
      };
      return {
        bois: typesBoiss.map((nom) => ({
          nom,
          enabled: true,
          prix: String(defaultBoisPrix[nom] ?? 150),
          unite: 'MAD/m²'
        })),
        finitions: finitionsMenuiserie.map((nom) => ({
          nom,
          enabled: true,
          // allow Brut = 0, others >0
          prix: String(defaultFinitionsPrix[nom] ?? 80),
          unite: 'MAD/service'
        })),
      };
    }
    if (type === 'peinture') {
      const defaultTypePeinturePrix = {
        'Acrylique': 30,
        'Glycéro': 35,
        'Écologique': 40,
        'Satinée': 32,
        'Mate': 30,
        'Brillante': 34,
        'Antirouille': 45,
        'Hydrofuge': 50,
      };
      const defaultSurfacePrix = {
        'Intérieur résidentiel': 25,
        'Extérieur résidentiel': 35,
        'Locaux commerciaux': 30,
        'Bureaux': 28,
        'Façades': 38,
        'Plafonds': 27,
        'Boiseries': 30,
        'Métaux': 40,
      };
      return {
        typesPeinture: typesPeinture.map((nom) => ({
          nom,
          enabled: true,
          prix: String(defaultTypePeinturePrix[nom] ?? 30),
          unite: 'MAD/m²'
        })),
        surfaces: surfacesPeinture.map((nom) => ({
          nom,
          enabled: true,
          prix: String(defaultSurfacePrix[nom] ?? 30),
          unite: 'MAD/m²'
        })),
      };
    }
    if (type === 'electricite') {
      const defaultTravauxPrix = {
        'Installation neuve': 300,
        'Rénovation': 350,
        'Mise aux normes': 400,
        'Dépannage': 200,
        'Maintenance': 180,
        'Domotique': 500,
        'Éclairage': 150,
        'Chauffage électrique': 250,
      };
      return {
        typesTravaux: typesTravauxElec.map((nom) => ({
          nom,
          enabled: true,
          prix: String(defaultTravauxPrix[nom] ?? 200),
          unite: 'MAD/service'
        })),
      };
    }
    return null;
  };


  // Fetch sub-services from backend when service type changes
  useEffect(() => {
    if (categorie) {
      const fetchBackendSubServices = async () => {
        setIsLoadingSubServices(true);
        try {
          const subs = await fetchSubServices({ type_service: categorie });
          setSubServices(subs || []);

          // Reset sub-service choice when main category changes
          setSelectedSubServiceId('');
          setSubServicePrice('');
          setSubServiceUnit('MAD/heure');
          setOptionsPricing(buildDefaultOptionsPricing(categorie));
        } catch (error) {
          console.error('Error fetching sub-services:', error);
          toast.error('Erreur lors du chargement des sous-services');
          setSubServices([]);
          setOptionsPricing(buildDefaultOptionsPricing(categorie));
        } finally {
          setIsLoadingSubServices(false);
        }
      };

      fetchBackendSubServices();

      // (no categories fetch here anymore)
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

  const updateOptionRow = (groupKey, nom, patch) => {
    setOptionsPricing((prev) => {
      if (!prev || !prev[groupKey]) return prev;
      return {
        ...prev,
        [groupKey]: prev[groupKey].map((row) => row.nom === nom ? { ...row, ...patch } : row),
      };
    });
  };

  const validateOptionsPricing = () => {
    if (!optionsPricing) return true;

    const validateGroup = (rows, groupLabel) => {
      const enabledRows = (rows || []).filter(r => r.enabled);
      if (enabledRows.length === 0) {
        toast.error(`Veuillez activer au moins une option (${groupLabel})`);
        return false;
      }
      for (const r of enabledRows) {
        const p = parseFloat(r.prix);
        // allow 0 for "Brut" finishing
        if (r.nom === 'Brut') continue;
        if (r.prix === '' || Number.isNaN(p) || p <= 0) {
          toast.error(`Prix invalide pour "${r.nom}" (${groupLabel})`);
          return false;
        }
      }
      return true;
    };

    if (categorie === 'menuiserie') {
      return validateGroup(optionsPricing.bois, 'Bois') && validateGroup(optionsPricing.finitions, 'Finitions');
    }
    if (categorie === 'peinture') {
      return validateGroup(optionsPricing.typesPeinture, 'Types de peinture') && validateGroup(optionsPricing.surfaces, 'Surfaces');
    }
    if (categorie === 'electricite') {
      return validateGroup(optionsPricing.typesTravaux, 'Types de travaux');
    }
    return true;
  };


  const handleCategorieToggle = (index) => {
    // removed (no categories in new schema)
  };

  const handlePriceChange = (index, field, value) => {
    // removed (no categories in new schema)
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.ville || !formData.adresse) {
        toast.error('Veuillez remplir la ville et l\'adresse');
        return false;
      }
      // Required to appear on map search
      if (formData.latitude === '' || formData.longitude === '') {
        toast.error('Veuillez renseigner votre latitude et longitude (nécessaire pour apparaître sur la carte)');
        return false;
      }
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180) {
        toast.error('Coordonnées GPS invalides (latitude [-90,90], longitude [-180,180])');
        return false;
      }
    } else if (step === 2) {
      if (!categorie) {
        toast.error('Veuillez sélectionner une catégorie');
        return false;
      }
      if (!selectedSubServiceId) {
        toast.error('Veuillez sélectionner un sous-service');
        return false;
      }
      if (!subServicePrice || isNaN(parseFloat(subServicePrice)) || parseFloat(subServicePrice) <= 0) {
        toast.error('Veuillez renseigner un prix valide pour le sous-service');
        return false;
      }
      if (categorie === 'menuiserie') {
        if (!specificFields.typeBois || specificFields.finitions.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques au menuisier');
          return false;
        }
      } else if (categorie === 'peinture') {
        if (specificFields.typesPeinture.length === 0 || specificFields.surfaces.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques au peintre');
          return false;
        }
      } else if (categorie === 'electricite') {
        if (specificFields.typesTravaux.length === 0) {
          toast.error('Veuillez remplir tous les champs spécifiques à l\'électricien');
          return false;
        }
      }
    } else if (step === 3) {
      if (!validateOptionsPricing()) return false;
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
      // Map frontend category to database enum
      const typeServiceMap = {
        menuiserie: 'menuiserie',
        peinture: 'peinture',
        electricite: 'electricite',
      };

      // Map price units to database enum
      const uniteMap = {
        'MAD/heure': 'par_heure',
        'MAD/m²': 'par_m2',
        'MAD/unité': 'par_unite',
        'MAD/jour': 'forfait',
        'MAD/service': 'par_service'
      };

      // Prepare service data for API (intervenant_id will be taken from authenticated user)
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('type_service', typeServiceMap[categorie] || categorie);

      // Auto-generate titre and description from category + specificFields
      const categoryLabel = categories.find(c => c.value === categorie)?.label || categorie;
      const subServiceLabel = subServices.find(s => String(s.id) === String(selectedSubServiceId))?.nom;
      let titreToSend = subServiceLabel ? `${categoryLabel} - ${subServiceLabel}` : categoryLabel;
      let descriptionToSend = subServiceLabel
        ? `Sous-service: ${subServiceLabel}. Prestations en ${categoryLabel}.`
        : `Prestations en ${categoryLabel}`;

      if (categorie === 'menuiserie') {
        if (specificFields.typeBois) titreToSend += ` - ${specificFields.typeBois}`;
        if (specificFields.finitions && specificFields.finitions.length) {
          titreToSend += ` (${specificFields.finitions.slice(0,3).join(', ')})`;
          descriptionToSend = `Travaux de menuiserie: types de bois (${specificFields.typeBois || 'divers'}); finitions: ${specificFields.finitions.join(', ')}.`;
        } else {
          descriptionToSend = `Travaux de menuiserie: types de bois ${specificFields.typeBois || 'divers'}.`;
        }
      } else if (categorie === 'peinture') {
        if (specificFields.typesPeinture && specificFields.typesPeinture.length) titreToSend += ` - ${specificFields.typesPeinture.slice(0,2).join(', ')}`;
        if (specificFields.surfaces && specificFields.surfaces.length) descriptionToSend = `Peinture pour surfaces: ${specificFields.surfaces.join(', ')}; types: ${specificFields.typesPeinture.join(', ')}.`;
      } else if (categorie === 'electricite') {
        if (specificFields.typesTravaux && specificFields.typesTravaux.length) titreToSend += ` - ${specificFields.typesTravaux.slice(0,2).join(', ')}`;
        if (specificFields.typesTravaux && specificFields.typesTravaux.length) descriptionToSend = `Travaux électriques: ${specificFields.typesTravaux.join(', ')}.`;
      }

      formDataToSend.append('titre', titreToSend);
      formDataToSend.append('description', descriptionToSend);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('adresse', formData.adresse);
      // GPS coordinates (required for map search)
      formDataToSend.append('latitude', String(parseFloat(formData.latitude)));
      formDataToSend.append('longitude', String(parseFloat(formData.longitude)));
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

      // Add specific parameters + options pricing
      formDataToSend.append('parametres_specifiques', JSON.stringify({
        ...specificFields,
        options_pricing: optionsPricing,
      }));

      // New schema fields (no categories)
      formDataToSend.append('sub_service_id', String(parseInt(selectedSubServiceId, 10)));
      formDataToSend.append('prix', String(parseFloat(subServicePrice)));
      formDataToSend.append('unite_prix', uniteMap[subServiceUnit] || 'par_heure');

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

  // Compute allowed categories based on authenticated user's métiers (if available)
  const allowedServiceTypes = userMetiers === null
    ? null
    : userMetiers.map(m => metierToTypeService[m]).filter(Boolean);

  const allowedCategories = userMetiers === null
    ? categories
    : categories.filter(c => allowedServiceTypes.includes(c.value));

  const cannotProceed = userMetiers !== null && userMetiers.length === 0;

  // If user only has one metier, preselect it. If the currently selected category
  // is no longer allowed (e.g. user changed metiers), clear it.
  useEffect(() => {
    if (!userMetiers) return;
    if (userMetiers.length === 1 && !categorie) {
      const only = metierToTypeService[userMetiers[0]];
      if (only) setCategorie(only);
    }
    if (categorie && userMetiers.length > 0 && !allowedServiceTypes.includes(categorie)) {
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
                {categorie === 'menuiserie' && <Hammer className="w-10 h-10 text-white" />}
                {categorie === 'peinture' && <Paintbrush className="w-10 h-10 text-white" />}
                {categorie === 'electricite' && <Zap className="w-10 h-10 text-white" />}
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
                  Options
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

                      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <p className="text-amber-900 font-semibold">Titre et description</p>
                        <p className="text-amber-700 mt-2">
                          Le titre et la description seront générés automatiquement à partir de la catégorie
                          sélectionnée et des paramètres spécifiques (ex. type de bois, finitions, types de travaux).
                        </p>
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

                  {/* GPS coordinates (required for map search) */}
                  <div className="space-y-3 mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-amber-900 font-semibold">Coordonnées GPS (obligatoires)</p>
                    <p className="text-amber-700 text-sm">
                      Pour que votre service apparaisse sur la carte, il faut une latitude et une longitude.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
                          placeholder="Ex: 34.0209"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-600 transition-colors"
                          placeholder="Ex: -6.8416"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!navigator.geolocation) {
                              toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
                              return;
                            }
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setFormData({
                                  ...formData,
                                  latitude: String(pos.coords.latitude),
                                  longitude: String(pos.coords.longitude),
                                });
                                toast.success('Position récupérée !');
                              },
                              () => toast.error('Impossible de récupérer votre position')
                            );
                          }}
                          className="w-full px-4 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold"
                        >
                          Ma position
                        </button>
                      </div>
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

                  {/* Sélection de la catégorie (placée ici) */}
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
                  {/* Sous-service (DB-backed) + prix */}
                  {categorie && (
                    <div className="space-y-4 pt-6 border-t border-amber-200">
                      <h3 className="text-xl text-amber-900 font-semibold">Sous-service (obligatoire)</h3>

                      {isLoadingSubServices ? (
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-amber-800">
                          Chargement des sous-services...
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-amber-900 mb-2 font-semibold">
                              Sous-service <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedSubServiceId}
                              onChange={(e) => setSelectedSubServiceId(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                            >
                              <option value="">Sélectionnez un sous-service</option>
                              {subServices.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.nom}
                                </option>
                              ))}
                            </select>
                            {subServices.length === 0 && (
                              <p className="text-sm text-amber-700 mt-2">
                                Aucun sous-service trouvé en base pour ce type. Vérifiez les seeders `SubServiceSeeder`.
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-amber-900 mb-2 font-semibold">
                                Prix (MAD) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={subServicePrice}
                                onChange={(e) => setSubServicePrice(e.target.value)}
                                placeholder="Ex: 100"
                                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-amber-900 mb-2 font-semibold">
                                Unité <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={subServiceUnit}
                                onChange={(e) => setSubServiceUnit(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 transition-colors"
                              >
                                <option value="MAD/heure">MAD/heure</option>
                                <option value="MAD/jour">MAD/jour</option>
                                <option value="MAD/m²">MAD/m²</option>
                                <option value="MAD/unité">MAD/unité</option>
                                <option value="MAD/service">MAD/service</option>
                              </select>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {categorie === 'menuiserie' && (
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

                  {categorie === 'peinture' && (
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

                  {categorie === 'electricite' && (
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

              {/* Étape 3: Options & Tarifs */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Euro className="w-6 h-6 text-amber-700" />
                    <h2 className="text-2xl text-amber-900">Options & Tarifs</h2>
                  </div>

                  <div className={`${colors.bgLight} border-2 ${colors.borderLight} rounded-lg p-4`}>
                    <p className="text-amber-900">
                      <span className="font-semibold">Définissez vos prix pour les options.</span><br />
                      Activez les options que vous proposez et indiquez un prix pour chacune.
                    </p>
                  </div>

                  {!optionsPricing ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800">
                      Impossible de charger les options pour ce type.
                    </div>
                  ) : (
                    <>
                      {categorie === 'menuiserie' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-3">Bois (prix)</h3>
                            <div className="space-y-2">
                              {optionsPricing.bois.map((row) => (
                                <div key={row.nom} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-2 border-amber-200 rounded-lg">
                                  <label className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={row.enabled}
                                      onChange={(e) => updateOptionRow('bois', row.nom, { enabled: e.target.checked })}
                                      className="w-5 h-5"
                                    />
                                    <span className="font-semibold text-amber-900">{row.nom}</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.prix}
                                      onChange={(e) => updateOptionRow('bois', row.nom, { prix: e.target.value })}
                                      disabled={!row.enabled}
                                      className="w-36 px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                      placeholder="Prix"
                                    />
                                    <select
                                      value={row.unite}
                                      onChange={(e) => updateOptionRow('bois', row.nom, { unite: e.target.value })}
                                      disabled={!row.enabled}
                                      className="px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                    >
                                      <option value="MAD/m²">MAD/m²</option>
                                      <option value="MAD/unité">MAD/unité</option>
                                      <option value="MAD/service">MAD/service</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-3">Finitions (prix)</h3>
                            <div className="space-y-2">
                              {optionsPricing.finitions.map((row) => (
                                <div key={row.nom} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-2 border-amber-200 rounded-lg">
                                  <label className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={row.enabled}
                                      onChange={(e) => updateOptionRow('finitions', row.nom, { enabled: e.target.checked })}
                                      className="w-5 h-5"
                                    />
                                    <span className="font-semibold text-amber-900">{row.nom}</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.prix}
                                      onChange={(e) => updateOptionRow('finitions', row.nom, { prix: e.target.value })}
                                      disabled={!row.enabled}
                                      className="w-36 px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                      placeholder="Prix"
                                    />
                                    <select
                                      value={row.unite}
                                      onChange={(e) => updateOptionRow('finitions', row.nom, { unite: e.target.value })}
                                      disabled={!row.enabled}
                                      className="px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                    >
                                      <option value="MAD/service">MAD/service</option>
                                      <option value="MAD/m²">MAD/m²</option>
                                      <option value="MAD/unité">MAD/unité</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {categorie === 'peinture' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-3">Types de peinture (prix)</h3>
                            <div className="space-y-2">
                              {optionsPricing.typesPeinture.map((row) => (
                                <div key={row.nom} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-2 border-amber-200 rounded-lg">
                                  <label className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={row.enabled}
                                      onChange={(e) => updateOptionRow('typesPeinture', row.nom, { enabled: e.target.checked })}
                                      className="w-5 h-5"
                                    />
                                    <span className="font-semibold text-amber-900">{row.nom}</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.prix}
                                      onChange={(e) => updateOptionRow('typesPeinture', row.nom, { prix: e.target.value })}
                                      disabled={!row.enabled}
                                      className="w-36 px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                      placeholder="Prix"
                                    />
                                    <select
                                      value={row.unite}
                                      onChange={(e) => updateOptionRow('typesPeinture', row.nom, { unite: e.target.value })}
                                      disabled={!row.enabled}
                                      className="px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                    >
                                      <option value="MAD/m²">MAD/m²</option>
                                      <option value="MAD/service">MAD/service</option>
                                      <option value="MAD/unité">MAD/unité</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-3">Surfaces (prix)</h3>
                            <div className="space-y-2">
                              {optionsPricing.surfaces.map((row) => (
                                <div key={row.nom} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-2 border-amber-200 rounded-lg">
                                  <label className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={row.enabled}
                                      onChange={(e) => updateOptionRow('surfaces', row.nom, { enabled: e.target.checked })}
                                      className="w-5 h-5"
                                    />
                                    <span className="font-semibold text-amber-900">{row.nom}</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.prix}
                                      onChange={(e) => updateOptionRow('surfaces', row.nom, { prix: e.target.value })}
                                      disabled={!row.enabled}
                                      className="w-36 px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                      placeholder="Prix"
                                    />
                                    <select
                                      value={row.unite}
                                      onChange={(e) => updateOptionRow('surfaces', row.nom, { unite: e.target.value })}
                                      disabled={!row.enabled}
                                      className="px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                    >
                                      <option value="MAD/m²">MAD/m²</option>
                                      <option value="MAD/service">MAD/service</option>
                                      <option value="MAD/unité">MAD/unité</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {categorie === 'electricite' && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-3">Types de travaux (prix)</h3>
                            <div className="space-y-2">
                              {optionsPricing.typesTravaux.map((row) => (
                                <div key={row.nom} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-2 border-amber-200 rounded-lg">
                                  <label className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={row.enabled}
                                      onChange={(e) => updateOptionRow('typesTravaux', row.nom, { enabled: e.target.checked })}
                                      className="w-5 h-5"
                                    />
                                    <span className="font-semibold text-amber-900">{row.nom}</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.prix}
                                      onChange={(e) => updateOptionRow('typesTravaux', row.nom, { prix: e.target.value })}
                                      disabled={!row.enabled}
                                      className="w-36 px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                      placeholder="Prix"
                                    />
                                    <select
                                      value={row.unite}
                                      onChange={(e) => updateOptionRow('typesTravaux', row.nom, { unite: e.target.value })}
                                      disabled={!row.enabled}
                                      className="px-3 py-2 border-2 border-amber-200 rounded-lg disabled:opacity-50"
                                    >
                                      <option value="MAD/service">MAD/service</option>
                                      <option value="MAD/heure">MAD/heure</option>
                                      <option value="MAD/unité">MAD/unité</option>
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
                    disabled={currentStep === 1 && cannotProceed}
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