// src/components/ServiceDetailsModal.jsx
import React from 'react';
import { X, MapPin, Star, Phone, Mail, User } from 'lucide-react';

export function ServiceDetailsModal({ service, onClose }) {
    if (!service) return null;

    const intervenant = service.intervenant || {
        surnom: service.surnom,
        nom: service.nom,
        prenom: service.prenom,
        photo_profil: service.image,
        telephone: service.telephone
    };

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
                        src={service.image}
                        alt={service.titre}
                        className="w-full h-full object-cover opacity-30"
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
                                src={intervenant.photo_profil || service.image}
                                alt={intervenant.surnom}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
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

                    {/* Pricing */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-amber-900 mb-4">Tarification</h3>
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <div className="text-center">
                                <div className="text-lg text-green-700 mb-2">Tarif</div>
                                <div className="text-4xl font-bold text-green-900">{service.tarif}</div>
                            </div>
                        </div>
                    </div>

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
                        <button
                            onClick={() => alert(`Contacter ${intervenant.surnom}`)}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
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
