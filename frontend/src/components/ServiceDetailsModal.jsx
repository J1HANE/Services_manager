// src/components/ServiceDetailsModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Star, Phone, Mail, User, Calendar, Package, FileText } from 'lucide-react';

export function ServiceDetailsModal({ service, onClose }) {
    const navigate = useNavigate();
    
    if (!service) return null;
    
    // Vérifier si l'utilisateur est connecté comme client
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isClient = user.role === 'client';
    
    const handleDemanderService = () => {
        onClose(); // Fermer le modal
        navigate(`/demander-service/${service.id}`);
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // If it's already a full URL (http/https), return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Otherwise, prefix with backend URL
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const backendUrl = API_BASE_URL.replace('/api', '');

        // Remove leading slash if present to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

        return `${backendUrl}/${cleanPath}`;
    };

    const intervenant = service.intervenant || {
        surnom: service.surnom,
        nom: service.nom,
        prenom: service.prenom,
        photo_profil: service.image,
        telephone: service.telephone
    };

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const disponibilites = service.disponibilites || [];
    const categories = service.categories || [];
    const subService = service.sub_service || null;
    const optionsPricing = service?.parametres_specifiques?.options_pricing || null;
    const groupLabels = {
        bois: 'Bois',
        finitions: 'Finitions',
        typesPeinture: 'Types de peinture',
        surfaces: 'Surfaces',
        typesTravaux: 'Types de travaux',
    };

    // Parse images_supplementaires if it's a JSON string
    let imagesSupplementaires = [];
    try {
        if (typeof service.images_supplementaires === 'string') {
            imagesSupplementaires = JSON.parse(service.images_supplementaires);
        } else if (Array.isArray(service.images_supplementaires)) {
            imagesSupplementaires = service.images_supplementaires;
        }
    } catch (e) {
        console.error('Error parsing images_supplementaires:', e);
        imagesSupplementaires = [];
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>

                {/* Header with Image */}
                <div className="relative h-64 bg-gradient-to-br from-amber-900 to-orange-800">
                    <img
                        src={getImageUrl(service.image)}
                        alt={service.titre}
                        className="w-full h-full object-cover opacity-30"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
                        }}
                    />
                    <div className="absolute inset-0 flex items-end p-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2">{service.titre || 'Service'}</h2>
                            <div className="flex items-center gap-2 text-white/90">
                                <MapPin className="w-5 h-5" />
                                <span className="text-lg">{service.ville}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Intervenant Section */}
                    <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-orange-200">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <User className="w-6 h-6" />
                            Intervenant
                        </h3>
                        <div className="flex items-center gap-6">
                            <img
                                src={getImageUrl(intervenant.photo_profil) || 'https://via.placeholder.com/150'}
                                alt={intervenant.surnom}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/150';
                                }}
                            />
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-amber-900 mb-1">{intervenant.surnom}</h4>
                                <p className="text-amber-700 mb-2">{intervenant.prenom} {intervenant.nom}</p>
                                {intervenant.telephone && (
                                    <div className="flex items-center gap-2 text-amber-800">
                                        <Phone className="w-4 h-4" />
                                        <span>{intervenant.telephone}</span>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <span className="text-sm text-amber-700">Expérience: </span>
                                    <span className="font-semibold text-amber-900">{service.experience}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Images Gallery */}
                    {(service.image || imagesSupplementaires.length > 0) && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4">Photos du Service</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {service.image && (
                                    <div className="relative group">
                                        <img
                                            src={getImageUrl(service.image)}
                                            alt="Image principale"
                                            className="w-full h-48 object-cover rounded-lg border-2 border-amber-300 shadow-md hover:shadow-xl transition-shadow"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
                                            }}
                                        />
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded">
                                            Principale
                                        </div>
                                    </div>
                                )}
                                {imagesSupplementaires.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-48 object-cover rounded-lg border-2 border-amber-200 shadow-md hover:shadow-xl transition-shadow"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Description</h3>
                        <p className="text-amber-800 leading-relaxed text-lg">{service.description}</p>
                    </div>

                    {/* Ratings Section */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Évaluations</h3>

                        {/* Overall Rating */}
                        <div className="mb-6 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-8 h-8 fill-yellow-500 text-yellow-500" />
                                        <span className="text-5xl font-bold text-amber-900">{service.rating.toFixed(1)}</span>
                                        <span className="text-2xl text-amber-700">/5</span>
                                    </div>
                                    <p className="text-amber-700">
                                        Basé sur <span className="font-bold text-amber-900">{service.nbAvis}</span> avis
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Ponctualité */}
                            <div className="p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm text-blue-700 font-semibold mb-2">Ponctualité</div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="w-5 h-5 fill-blue-500 text-blue-500" />
                                        <span className="text-2xl font-bold text-blue-900">{service.moyenne_ponctualite?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="w-full bg-blue-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${(service.moyenne_ponctualite || 0) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Propreté */}
                            <div className="p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm text-green-700 font-semibold mb-2">Propreté</div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="w-5 h-5 fill-green-500 text-green-500" />
                                        <span className="text-2xl font-bold text-green-900">{service.moyenne_proprete?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="w-full bg-green-100 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all"
                                            style={{ width: `${(service.moyenne_proprete || 0) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Qualité */}
                            <div className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm text-purple-700 font-semibold mb-2">Qualité</div>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
                                        <span className="text-2xl font-bold text-purple-900">{service.moyenne_qualite?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="w-full bg-purple-100 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full transition-all"
                                            style={{ width: `${(service.moyenne_qualite || 0) * 20}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Statistics */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Statistiques</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                                <div className="text-center">
                                    <div className="text-sm text-blue-700 mb-2">Missions Complétées</div>
                                    <div className="text-4xl font-bold text-blue-900">{service.missions_completees || 0}</div>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                                <div className="text-center">
                                    <div className="text-sm text-purple-700 mb-2">Catégories</div>
                                    <div className="text-4xl font-bold text-purple-900">{service.total_categories || 0}</div>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                                <div className="text-center">
                                    <div className="text-sm text-green-700 mb-2">Disponible depuis</div>
                                    <div className="text-lg font-bold text-green-900">
                                        {service.disponible_depuis ? new Date(service.disponible_depuis).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Availability Days */}
                    {disponibilites.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Jours de Disponibilité
                            </h3>
                            <div className="grid grid-cols-7 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                    const isAvailable = disponibilites.includes(day);
                                    return (
                                        <div
                                            key={day}
                                            className={`p-3 rounded-lg text-center font-semibold transition-all ${isAvailable
                                                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                                }`}
                                        >
                                            <div className="text-xs mb-1">{dayNames[day - 1].substring(0, 3)}</div>
                                            <div className="text-lg">{isAvailable ? '✓' : '✗'}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sous-service (new schema) */}
                    {subService && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Package className="w-6 h-6" />
                                Sous-service
                            </h3>
                            <div className="p-6 bg-white rounded-lg border-2 border-amber-200 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-xl font-bold text-amber-900">{subService.nom}</div>
                                        {subService.description && (
                                            <div className="text-amber-700 mt-1">{subService.description}</div>
                                        )}
                                    </div>
                                    {(service.prix || service.unite_prix) && (
                                        <div className="text-right">
                                            {service.prix && <div className="text-2xl font-bold text-green-700">{service.prix}</div>}
                                            {service.unite_prix && <div className="text-xs text-gray-600">{service.unite_prix}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Options pricing (menuiserie/peinture/electricite) */}
                    {optionsPricing && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Package className="w-6 h-6" />
                                Options & Tarifs
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(optionsPricing).map(([groupKey, rows]) => {
                                    if (!Array.isArray(rows)) return null;
                                    const enabled = rows.filter(r => r && r.enabled);
                                    if (enabled.length === 0) return null;
                                    return (
                                        <div key={groupKey} className="p-4 bg-white rounded-lg border-2 border-amber-200">
                                            <div className="text-sm font-semibold text-amber-900 mb-3">{groupLabels[groupKey] || groupKey}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {enabled.map((r) => (
                                                    <div key={r.nom} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <div className="font-semibold text-amber-900">{r.nom}</div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-green-700">{r.prix}</div>
                                                            <div className="text-xs text-gray-600">{r.unite}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Legacy categories (optional / backward compatibility) */}
                    {categories.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <Package className="w-6 h-6" />
                                Options / catégories
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="p-4 bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-amber-900 mb-1">{category.nom}</h4>
                                                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                                    {category.type_categorie}
                                                </span>
                                            </div>
                                            {category.prix && (
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-700">{category.prix}</div>
                                                    <div className="text-xs text-gray-600">{category.unite_prix}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Localisation</h3>
                        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-orange-200">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-6 h-6 text-orange-600 mt-1" />
                                <div>
                                    <div className="font-bold text-amber-900 text-lg mb-1">{service.ville}</div>
                                    <div className="text-amber-700">{service.adresse}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        {isClient && (
                            <button
                                onClick={handleDemanderService}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Faire une demande
                            </button>
                        )}
                        <button
                            onClick={() => alert(`Contacter ${intervenant.surnom}`)}
                            className={`px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl ${isClient ? 'flex-1' : 'flex-1'}`}
                        >
                            Contacter l'intervenant
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServiceDetailsModal;
