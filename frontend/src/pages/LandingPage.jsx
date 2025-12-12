// src/pages/LandingPage.jsx (version simplifiée sans footer)
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Clock, Users, Hammer, Paintbrush, Zap, Star, CheckCircle, ChevronDown, Home, Plus, User } from 'lucide-react';
import Footer from '../components/Footer'; // Import du footer séparé
import { Header } from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.98)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slides = [
    {
      title: 'En recherche de menuisier ?',
      image: 'https://images.unsplash.com/photo-1626081062126-d3b192c1fcb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50cnklMjB3b29kd29ya3xlbnwxfHx8fDE3NjUxMTcxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      service: 'Menuiserie',
    },
    {
      title: 'En recherche de service peinture ?',
      image: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTAwNjc3MXww&ixlib=rb-4.1.0&q=80&w=1080',
      service: 'Peinture',
    },
    {
      title: "En recherche de service d'électricité ?",
      image: 'https://images.unsplash.com/photo-1595831708961-1b13c0dd2422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdpcmluZ3xlbnwxfHx8fDE3NjUxMTcxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      service: 'Électricité',
    },
  ];

  const services = [
    {
      id: 1,
      title: 'Menuiserie',
      icon: Hammer,
      image: 'https://images.unsplash.com/photo-1626081062126-d3b192c1fcb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50cnklMjB3b29kd29ya3xlbnwxfHx8fDE3NjUxMTcxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Experts en menuiserie sur mesure',
    },
    {
      id: 2,
      title: 'Peinture',
      icon: Paintbrush,
      image: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTAwNjc3MXww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Professionnels de la peinture intérieure et extérieure',
    },
    {
      id: 3,
      title: 'Électricité',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1595831708961-1b13c0dd2422?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdpcmluZ3xlbnwxfHx8fDE3NjUxMTcxODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Électriciens certifiés et qualifiés',
    },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Sécurité',
      description: 'Plateforme 100% sécurisée avec vérification de tous les intervenants',
    },
    {
      icon: Clock,
      title: 'Support 24/7',
      description: 'Notre équipe est disponible 24h/24 et 7j/7 pour vous accompagner',
    },
    {
      icon: Users,
      title: 'Confiance',
      description: 'Des milliers de clients satisfaits nous font confiance chaque jour',
    },
  ];

  const testimonials = [
    {
      type: 'Intervenant',
      name: 'Marc D.',
      role: 'Menuisier',
      text: "L'application m'a permis de gagner des clients fidèles et de développer mon activité de manière significative. Un outil indispensable pour les professionnels !",
      rating: 5,
    },
    {
      type: 'Client',
      name: 'Sophie L.',
      role: 'Cliente',
      text: "L'application m'a permis de trouver un intervenant très compétent en quelques clics. Service rapide, professionnel et sécurisé. Je recommande vivement !",
      rating: 5,
    },
    {
      type: 'Intervenant',
      name: 'Ahmed K.',
      role: 'Électricien',
      text: "Grâce à cette plateforme, j'ai pu élargir ma clientèle et gérer mes rendez-vous facilement. Interface intuitive et support réactif.",
      rating: 5,
    },
    {
      type: 'Client',
      name: 'Julie M.',
      role: 'Cliente',
      text: "Excellente expérience ! J'ai trouvé un peintre professionnel pour rénover mon appartement. Résultat impeccable et prix transparent.",
      rating: 5,
    },
  ];

  const goToService = (title) => {
    if (title === 'Menuiserie') return navigate('/menuiserie');
    if (title === 'Peinture') return navigate('/peinture');
    if (title === 'Électricité') return navigate('/electricite');
    return navigate('/tous-services');
  };

  return (
     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Utiliser le Header component */}
      <Header />{/* Header animé avec menus déroulants */}
     

      {/* Hero Section avec Slides */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* ... Hero content (identique) ... */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* Image de fond */}
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            </div>

            {/* Contenu */}
            <div className="relative flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl text-center">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8 text-5xl text-white md:text-7xl"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mb-12 text-2xl text-white/90"
                >
                  Découvrez les meilleurs professionnels dans votre région en quelques clics
                </motion.p>
                <motion.button
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 text-xl text-white transition-all shadow-2xl bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:shadow-3xl"
                  onClick={() => navigate('/tous-services')}
                >
                  Découvrir
                </motion.button>
              </div>
            </div>

            {/* Indicateurs de slides */}
            <div className="absolute flex gap-3 transform -translate-x-1/2 bottom-8 left-1/2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-white w-10' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Info Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
        {/* ... Info content (identique) ... */}
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl text-amber-900">100% Sécurisé</div>
                <div className="text-sm text-green-800">Environnement protégé</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl text-amber-900">Support 24/7</div>
                <div className="text-sm text-green-800">Assistance disponible</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl text-amber-900">Clients Fidèles</div>
                <div className="text-sm text-green-800">Une clientèle de confiance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
        {/* ... CTA content (identique) ... */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-4xl text-amber-900">
            Commencez Maintenant
          </h2>
          <p className="mb-10 text-xl text-green-800">
            Intervenant en recherche de clients ? Client en recherche de service ?<br />
            Trouvez tout ce dont vous avez besoin dans un environnement sécurisé et protégé
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all min-w-[260px]"
              onClick={() => navigate('/recherche-intervenants')}
            >
              Client en recherche de service ?
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all min-w-[260px]"
              onClick={() => navigate('/inscription')}
            >
              Intervenant en recherche de clients ?
            </motion.button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
        {/* ... Services content (identique) ... */}
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl text-amber-900">Nos Services</h2>
            <p className="text-xl text-green-800">
              Découvrez nos intervenants qualifiés dans chaque domaine
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="overflow-hidden transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-2xl group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute flex items-center justify-center w-12 h-12 rounded-full top-4 right-4 bg-gradient-to-br from-amber-500 to-orange-600">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-2xl text-amber-900">{service.title}</h3>
                  <p className="mb-4 text-green-800">{service.description}</p>
                  <button 
                    className="flex items-center gap-2 text-orange-600 transition-colors hover:text-orange-700 group/btn"
                    onClick={() => goToService(service.title)}
                  >
                    <span>Découvrir les intervenants</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
        {/* ... About content (identique) ... */}
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="mb-6 text-4xl text-amber-900">À Propos de ServicePro</h2>
              <p className="mb-4 text-lg text-green-800">
                Notre mission est de vous donner l'opportunité de découvrir les meilleurs
                intervenants dans votre région en quelques clics seulement. Nous nous engageons à
                créer un environnement sécurisé où clients et professionnels peuvent se rencontrer
                en toute confiance.
              </p>
              <p className="mb-4 text-lg text-green-800">
                La plateforme ServicePro est entièrement sécurisée et protégée. Tous nos
                intervenants sont vérifiés et certifiés pour garantir la qualité de nos services.
              </p>
              <p className="text-lg text-green-800">
                Notre équipe de support est disponible 24h/24 et 7j/7 pour répondre à toutes vos
                questions et vous accompagner dans vos démarches. Nous veillons à maintenir une
                clientèle qui nous fait confiance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="p-8 shadow-xl bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 text-xl text-amber-900">Simplicité</h4>
                      <p className="text-green-800">
                        Trouvez un professionnel en quelques clics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 text-xl text-amber-900">Qualité</h4>
                      <p className="text-green-800">
                        Tous nos intervenants sont vérifiés et certifiés
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="mb-2 text-xl text-amber-900">Rapidité</h4>
                      <p className="text-green-800">
                        Des réponses rapides de professionnels disponibles
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="px-4 py-20 sm:px-6 lg:px-8 bg-white/50">
        {/* ... Values content (identique) ... */}
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl text-amber-900">Nos Valeurs</h2>
            <p className="text-xl text-green-800">
              Ce qui nous guide au quotidien
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-8 text-center transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl text-amber-900">{value.title}</h3>
                <p className="text-green-800">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
        {/* ... Testimonials content (identique) ... */}
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl text-amber-900">Témoignages</h2>
            <p className="text-xl text-green-800">
              Ce que nos clients et intervenants disent de nous
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 transition-shadow bg-white shadow-lg rounded-2xl hover:shadow-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <p className="mb-6 italic text-green-800">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                    <span className="text-white">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-amber-900">{testimonial.name}</div>
                    <div className="text-sm text-green-700">
                      {testimonial.type} - {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-600 via-orange-600 to-green-700">
        {/* ... CTA content (identique) ... */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 text-4xl text-white">
              Commencez Maintenant
            </h2>
            <p className="mb-8 text-xl text-white/90">
              Trouvez tout ce dont vous avez besoin dans un environnement sécurisé et protégé
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 transition-all bg-white shadow-lg text-amber-900 rounded-xl hover:shadow-2xl"
                onClick={() => navigate('/inscription')}
              >
                Inscription Client
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-white transition-all shadow-lg bg-amber-900 rounded-xl hover:shadow-2xl"
                onClick={() => navigate('/inscription')}
              >
                Inscription Intervenant
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer séparé */}
      <Footer />
    </div>
  );
}
