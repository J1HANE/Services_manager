// src/pages/InscriptionPage.jsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, UserCircle, Briefcase, 
  Hammer, Paintbrush, Zap, Camera, X 
} from 'lucide-react';
import API from '../api/axios';

function InscriptionPage() {
  const [step, setStep] = useState('role');
  const [role, setRole] = useState('');
  const [selectedMetiers, setSelectedMetiers] = useState([]); // Tableau des métiers sélectionnés
  const [principalMetier, setPrincipalMetier] = useState(''); // Métier principal
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const metiers = [
    { value: 'menuisier', label: 'Menuisier', icon: Hammer, color: 'amber' },
    { value: 'peintre', label: 'Peintre', icon: Paintbrush, color: 'orange' },
    { value: 'electricien', label: 'Électricien', icon: Zap, color: 'green' }
  ];


  // Fonction pour gérer la sélection/désélection des métiers
const handleMetierToggle = (metierValue) => {
  if (selectedMetiers.includes(metierValue)) {
    // Désélectionner le métier
    const newMetiers = selectedMetiers.filter(m => m !== metierValue);
    setSelectedMetiers(newMetiers);
    
    // Si on désélectionne le métier principal, choisir un nouveau principal
    if (principalMetier === metierValue) {
      setPrincipalMetier(newMetiers[0] || '');
    }
  } else {
    // Vérifier qu'on ne dépasse pas 2 métiers
    if (selectedMetiers.length < 2) {
      setSelectedMetiers([...selectedMetiers, metierValue]);
      
      // Si c'est le premier métier sélectionné, le définir comme principal
      if (selectedMetiers.length === 0) {
        setPrincipalMetier(metierValue);
      }
    } else {
      alert('Vous pouvez sélectionner maximum 2 métiers');
    }
  }
};

// Fonction pour changer le métier principal
const handlePrincipalChange = (metierValue) => {
  if (selectedMetiers.includes(metierValue)) {
    setPrincipalMetier(metierValue);
  }
};

// Fonction pour vider la sélection
const clearMetiers = () => {
  setSelectedMetiers([]);
  setPrincipalMetier('');
};

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('form');
    if (selectedRole === 'client') {
      setMetier('');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('La photo ne doit pas dépasser 5MB');
        return;
      }
      
      setProfilePhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  // Validation des mots de passe
  if (formData.password !== formData.confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    setIsSubmitting(false);
    return;
  }
  
  // Validation pour les intervenants : au moins un métier requis
  if (role === 'intervenant' && selectedMetiers.length === 0) {
    alert('Veuillez sélectionner au moins un métier pour les intervenants');
    setIsSubmitting(false);
    return;
  }
  
  try {
    const formDataToSend = new FormData();
    
    // Informations de base
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('telephone', formData.telephone);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('password_confirmation', formData.confirmPassword);
    formDataToSend.append('role', role);
    
    // Métiers pour les intervenants
    if (role === 'intervenant' && selectedMetiers.length > 0) {
      formDataToSend.append('metiers', JSON.stringify(selectedMetiers));
      formDataToSend.append('principal_metier', principalMetier || selectedMetiers[0]);
    }
    
    // Photo de profil
    if (profilePhoto) {
      formDataToSend.append('photo_profil', profilePhoto);
    }
    
    // Debug : voir ce qui est envoyé
    console.log('Métiers envoyés:', selectedMetiers);
    console.log('Métier principal:', principalMetier);
    
    const response = await API.post('/register', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Inscription réussie:', response.data);
    alert('Inscription réussie ! Vous allez être redirigé vers la connexion.');
    
    setTimeout(() => {
      window.location.href = '/connexion';
    }, 2000);
    
  } catch (error) {
    console.error('Erreur:', error.response?.data || error.message);
    
    // Messages d'erreur spécifiques
    if (error.response?.data?.error?.includes('métier')) {
      alert(`Erreur métier: ${error.response.data.error}`);
    } else {
      alert(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-900 via-orange-900 to-green-900" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="px-4 pt-32 pb-12">
          <div className="max-w-2xl mx-auto">
            {/* Card */}
            <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 shadow-lg bg-gradient-to-br from-amber-700 via-orange-800 to-green-900 rounded-2xl">
                  <Hammer className="w-10 h-10 text-white" />
                </div>
                <h1 className="mb-2 text-4xl text-amber-900">
                  {step === 'role' ? 'Choisissez votre profil' : 'Inscription'}
                </h1>
                <p className="text-amber-700">
                  {step === 'role' 
                    ? 'Sélectionnez le type de compte que vous souhaitez créer'
                    : `Créer votre compte ${role === 'client' ? 'Client' : 'Intervenant'}`
                  }
                </p>
              </div>

              {/* Étape 1: Choix du rôle */}
              {step === 'role' && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Client */}
                  <button
                    onClick={() => handleRoleSelect('client')}
                    className="p-8 transition-all bg-white border-3 border-amber-200 rounded-2xl hover:border-blue-500 hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 transition-colors bg-blue-100 rounded-2xl group-hover:bg-blue-200">
                      <UserCircle className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-2xl text-amber-900">Client</h3>
                    <p className="text-amber-700">
                      Je recherche des professionnels pour mes projets
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-left text-amber-700">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Trouver des intervenants</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Gérer vos demandes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Évaluer les services</span>
                      </li>
                    </ul>
                  </button>

                  {/* Intervenant */}
                  <button
                    onClick={() => handleRoleSelect('intervenant')}
                    className="p-8 transition-all bg-white border-3 border-amber-200 rounded-2xl hover:border-amber-700 hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 transition-colors bg-orange-100 rounded-2xl group-hover:bg-orange-200">
                      <Briefcase className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="mb-2 text-2xl text-amber-900">Intervenant</h3>
                    <p className="text-amber-700">
                      Je propose mes services professionnels
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-left text-amber-700">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Publier vos services</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Gérer vos interventions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Développer votre activité</span>
                      </li>
                    </ul>
                  </button>
                </div>
              )}

              {/* Étape 2: Formulaire d'inscription */}
              {step === 'form' && (
                <>
                  {/* Bouton retour */}
                  <button
                    onClick={() => {
                      setStep('role');
                      setMetier('');
                      setProfilePhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="flex items-center gap-2 mb-6 font-semibold text-amber-800 hover:text-amber-900"
                  >
                    ← Changer de profil
                  </button>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo de profil */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="w-32 h-32 overflow-hidden border-4 rounded-full border-amber-200">
                          {photoPreview ? (
                            <img 
                              src={photoPreview} 
                              alt="Preview" 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-amber-100">
                              <UserCircle className="w-16 h-16 text-amber-600" />
                            </div>
                          )}
                        </div>
                        
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute p-1 bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute p-2 rounded-full bg-amber-600 bottom-2 right-2 hover:bg-amber-700"
                        >
                          <Camera className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <p className="text-sm text-amber-700">
                        {photoPreview ? 'Photo sélectionnée' : 'Ajouter une photo de profil (optionnel)'}
                      </p>
                      <p className="text-xs text-amber-600">Max. 5MB - JPG, PNG</p>
                    </div>

                    {/* Nom et Prénom */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 font-semibold text-amber-900">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            placeholder="Dupont"
                            className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-amber-900">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                          <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            placeholder="Jean"
                            className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@example.com"
                          className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                      </div>
                    </div>

                   {role === 'intervenant' && (
  <div className="pt-6 border-t border-amber-200">
    <h3 className="mb-4 text-xl font-bold text-amber-900">
      Sélectionnez vos métiers (max 2) <span className="text-red-500">*</span>
    </h3>
    
    {/* Compteur et bouton de réinitialisation */}
    <div className="flex items-center justify-between mb-4">
      <div className="text-amber-700">
        {selectedMetiers.length === 0 ? (
          <span className="text-amber-600">Sélectionnez 1 ou 2 métiers</span>
        ) : (
          <span className="font-semibold">
            {selectedMetiers.length}/2 métiers sélectionnés
          </span>
        )}
      </div>
      
      {selectedMetiers.length > 0 && (
        <button
          type="button"
          onClick={clearMetiers}
          className="text-sm font-semibold text-red-600 hover:text-red-800"
        >
          Tout effacer
        </button>
      )}
    </div>
    
    {/* Grille des métiers */}
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
      {metiers.map((m) => {
        const Icon = m.icon;
        const isSelected = selectedMetiers.includes(m.value);
        const isDisabled = selectedMetiers.length >= 2 && !isSelected;
        
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => handleMetierToggle(m.value)}
            disabled={isDisabled}
            className={`
              p-6 rounded-xl border-2 transition-all relative
              ${isSelected 
                ? `border-${m.color}-600 bg-${m.color}-50 ring-2 ring-${m.color}-200` 
                : 'border-amber-200 hover:border-amber-400'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              group
            `}
          >
            {/* Badge de sélection */}
            {isSelected && (
              <div className="absolute flex items-center justify-center bg-green-500 rounded-full shadow-lg -top-2 -right-2 w-7 h-7">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* Numéro d'ordre si sélectionné */}
            {isSelected && (
              <div className="absolute flex items-center justify-center text-sm font-bold text-white rounded-full -top-2 -left-2 w-7 h-7 bg-amber-600">
                {selectedMetiers.indexOf(m.value) + 1}
              </div>
            )}
            
            {/* Icône du métier */}
            <Icon className={`
              w-10 h-10 mx-auto mb-3 transition-transform group-hover:scale-110
              ${isSelected ? `text-${m.color}-700` : 'text-amber-600'}
            `} />
            
            {/* Nom du métier */}
            <div className={`
              font-semibold transition-colors
              ${isSelected ? `text-${m.color}-900` : 'text-amber-900'}
            `}>
              {m.label}
            </div>
            
            {/* Indicateur "principal" */}
            {isSelected && principalMetier === m.value && (
              <div className="mt-2 text-xs font-bold text-green-600">
                ★ Principal
              </div>
            )}
            
            {/* Message d'état désactivé */}
            {isDisabled && (
              <div className="mt-2 text-xs text-amber-600">
                Maximum atteint
              </div>
            )}
          </button>
        );
      })}
    </div>
    
    {/* Section des métiers sélectionnés avec gestion du principal */}
    {selectedMetiers.length > 0 && (
      <div className="p-5 mb-6 border-2 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 rounded-xl">
        <h4 className="mb-4 text-lg font-bold text-amber-900">
          Configuration de vos métiers
        </h4>
        
        <div className="space-y-4">
          {selectedMetiers.map((metierCode, index) => {
            const metier = metiers.find(m => m.value === metierCode);
            const isPrincipal = principalMetier === metierCode;
            
            return (
              <div 
                key={metierCode} 
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all
                  ${isPrincipal 
                    ? 'bg-white border-amber-400 shadow-md' 
                    : 'bg-amber-100/50 border-amber-200'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Numéro */}
                  <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-full bg-amber-600">
                    {index + 1}
                  </div>
                  
                  {/* Icône et nom */}
                  <div className="flex items-center gap-3">
                    {metier && React.createElement(metier.icon, { 
                      className: `w-6 h-6 ${isPrincipal ? 'text-amber-700' : 'text-amber-600'}` 
                    })}
                    <div>
                      <span className="font-semibold text-amber-900">
                        {metier?.label}
                      </span>
                      <div className="text-xs text-amber-700">
                        {metierCode}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bouton radio pour sélectionner comme principal */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="principal_metier"
                      value={metierCode}
                      checked={isPrincipal}
                      onChange={() => handlePrincipalChange(metierCode)}
                      className="sr-only" // Hidden but accessible
                    />
                    <div className={`
                      w-6 h-6 border-2 rounded-full flex items-center justify-center
                      ${isPrincipal 
                        ? 'border-amber-600 bg-amber-600' 
                        : 'border-amber-400 bg-white'
                      }
                    `}>
                      {isPrincipal && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className={`font-semibold ${isPrincipal ? 'text-amber-900' : 'text-amber-700'}`}>
                    {isPrincipal ? 'Principal' : 'Définir comme principal'}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        
        {/* Aide et informations */}
        <div className="p-3 mt-4 border rounded-lg bg-white/70 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-amber-800">
              <p className="mb-1 font-semibold">Information importante :</p>
              <ul className="pl-4 space-y-1 list-disc">
                <li>Le <span className="font-semibold">métier principal</span> sera affiché en premier sur votre profil</li>
                <li>Vous pourrez créer des services pour chacun de vos métiers</li>
                <li>Vous pouvez modifier votre choix plus tard dans vos paramètres</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Validation et messages d'erreur */}
    {selectedMetiers.length === 0 && (
      <div className="p-4 text-center border-2 border-dashed rounded-lg border-amber-300 bg-amber-50">
        <p className="text-amber-700">
          <span className="font-semibold">Sélectionnez au moins un métier</span> pour continuer
        </p>
      </div>
    )}
    
    {selectedMetiers.length === 2 && (
      <div className="p-3 text-center border-2 border-green-300 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
        <p className="font-semibold text-green-800">
          ✓ Maximum de 2 métiers atteint
        </p>
        <p className="mt-1 text-sm text-green-700">
          Vous pouvez ajuster votre sélection ci-dessus si nécessaire
        </p>
      </div>
    )}
  </div>
)}

                    {/* Mot de passe */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full py-3 pl-12 pr-12 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute transform -translate-y-1/2 right-4 top-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-amber-700">Au moins 8 caractères</p>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full py-3 pl-12 pr-12 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute transform -translate-y-1/2 right-4 top-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="p-4 border-2 rounded-lg bg-amber-50 border-amber-200">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          required
                          className="w-5 h-5 mt-1 rounded text-amber-600 border-amber-300 focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-900">
                          J'accepte les{' '}
                          <a href="/conditions" className="font-semibold underline text-amber-800 hover:text-amber-900">
                            Conditions Générales d'Utilisation
                          </a>{' '}
                          et la{' '}
                          <a href="/confidentialite" className="font-semibold underline text-amber-800 hover:text-amber-900">
                            Politique de Confidentialité
                          </a>
                        </span>
                      </label>
                    </div>

                    {/* Bouton d'inscription */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-amber-700 via-orange-800 to-green-900 hover:shadow-xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                  </form>

                  {/* Lien vers connexion */}
                  <div className="mt-8 text-center">
                    <p className="text-amber-800">
                      Déjà un compte ?{' '}
                      <Link
                        to="/connexion"
                        className="font-semibold underline text-amber-900 hover:text-orange-800"
                      >
                        Se connecter
                      </Link>
                    </p>
                    <p className="mt-4 text-amber-800">
                      <Link
                        to="/"
                        className="font-semibold text-amber-900 hover:text-orange-800"
                      >
                        ← Retour à l'accueil
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default InscriptionPage;