# Services Manager - Backend Architecture & API Documentation

## 📋 Project Overview

**Project Name:** Services Manager (ServicePro)  
**Type:** Platform de mise en relation entre clients et artisans  
**Technology Stack:**  
- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React + Vite
- **Database:** MySQL
- **Authentication:** Laravel Sanctum (Token-based)
- **API Architecture:** RESTful API

---

## 🏗️ Architecture Backend

### 1. Structure MVC (Model-View-Controller)

Le backend suit le pattern MVC de Laravel avec une architecture modulaire:

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── API/
│   │           ├── Auth/          # Authentification
│   │           ├── Artisan/       # Gestion des services
│   │           ├── Client/        # Recherche et demandes
│   │           ├── Mission/       # Workflow des missions
│   │           └── Admin/         # Back-office
│   └── Models/
│       ├── User.php
│       ├── Service.php
│       ├── Categorie.php
│       ├── Demande.php
│       └── ...
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── api.php                    # Point d'entrée de l'API
```

### 2. Séparation des Responsabilités

**Controllers (Contrôleurs):**
- Gèrent la logique métier
- Valident les données entrantes
- Retournent des réponses JSON standardisées

**Models (Modèles):**
- Représentent les tables de la base de données
- Définissent les relations entre entités
- Encapsulent la logique de données

**Routes:**
- Définissent les endpoints de l'API
- Appliquent les middlewares (auth, CORS)
- Organisent les routes par fonctionnalité

---

## 🔐 Système d'Authentification

### Laravel Sanctum

**Fonctionnement:**
1. **Inscription/Connexion:** L'utilisateur envoie email + mot de passe
2. **Génération de Token:** Le backend crée un token unique
3. **Stockage:** Le token est stocké en base de données et renvoyé au client
4. **Authentification:** Le client envoie le token dans le header `Authorization: Bearer {token}`
5. **Validation:** Le middleware `auth:sanctum` vérifie le token à chaque requête

**Endpoints d'authentification:**

```php
// Routes publiques
POST /api/register  // Inscription
POST /api/login     // Connexion

// Routes protégées
POST /api/logout    // Déconnexion
GET  /api/me        // Informations utilisateur connecté
```

**Exemple de réponse login:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 4,
    "nom": "Lyamani",
    "prenom": "Ismail",
    "email": "ismail.lyamani@test.com",
    "role": "intervenant"
  },
  "token": "1|abc123xyz..."
}
```

---

## 📊 Base de Données

### Schéma Principal

#### Table `users`
```sql
- id (PK)
- nom, prenom, email
- mot_de_passe (hashé avec bcrypt)
- role (enum: 'client', 'intervenant', 'admin')
- telephone, photo_profil
- est_verifie (boolean)
- note_moyenne, nb_avis
```

#### Table `services`
```sql
- id (PK)
- intervenant_id (FK → users)
- type_service (enum: 'menuiserie', 'peinture', 'electricite')
- titre, description
- ville, adresse, latitude, longitude
- rayon_km
- parametres_specifiques (JSON)
- est_actif, statut
```

#### Table `categories`
```sql
- id (PK)
- type_service (menuiserie, peinture, electricite)
- type_categorie (service, materiel, autre)
- nom, description
```

#### Table `service_categories` (Pivot)
```sql
- id (PK)
- service_id (FK → services)
- category_id (FK → categories)
- prix (decimal)
- unite_prix (enum: 'par_heure', 'par_m2', 'par_unite', 'forfait')
```

### Relations Eloquent

```php
// Service.php
public function intervenant() {
    return $this->belongsTo(User::class, 'intervenant_id');
}

public function serviceCategories() {
    return $this->hasMany(ServiceCategorie::class);
}

// ServiceCategorie.php
public function service() {
    return $this->belongsTo(Service::class);
}

public function categorie() {
    return $this->belongsTo(Categorie::class, 'category_id');
}
```

---

## 🛣️ API Routes Structure

### Routes Publiques (Sans authentification)

```php
GET  /api/search              // Rechercher des services
GET  /api/artisan/{id}        // Profil public d'un artisan
GET  /api/categories          // Liste des catégories
POST /api/register            // Inscription
POST /api/login               // Connexion
```

### Routes Protégées (Authentification requise)

#### Espace Artisan
```php
GET    /api/my-services                    // Mes services
POST   /api/services                       // Créer un service
PUT    /api/services/{id}                  // Modifier un service
PATCH  /api/services/{id}/toggle           // Activer/Désactiver

GET    /api/services/{id}/disponibilites   // Voir agenda
PUT    /api/services/{id}/disponibilites/semaine  // Définir semaine type
POST   /api/services/{id}/disponibilites/date     // Ajouter congé
```

#### Espace Client
```php
POST   /api/demandes          // Créer une demande
GET    /api/demandes          // Historique des demandes
```

#### Workflow Mission
```php
PATCH  /api/missions/{id}/accept    // Accepter mission
PATCH  /api/missions/{id}/refuse    // Refuser mission
PATCH  /api/missions/{id}/complete  // Terminer mission
POST   /api/reviews                 // Laisser un avis
```

---

## 💡 Exemple Concret: Création de Service

### 1. Requête Frontend

```javascript
const response = await fetch('http://localhost:8000/api/services', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type_service: 'menuiserie',
    titre: 'Fabrication de meubles sur mesure',
    description: 'Spécialiste en ébénisterie...',
    ville: 'Kenitra',
    adresse: '123 Rue Mohammed V',
    latitude: 34.2610,
    longitude: -6.5802,
    rayon_km: 20,
    parametres_specifiques: {
      typeBois: 'Chêne',
      finitions: ['Vernis', 'Laqué']
    },
    categories: [
      { category_id: 1, prix: 150, unite_prix: 'par_heure' },
      { category_id: 3, prix: 2500, unite_prix: 'forfait' }
    ]
  })
});
```

### 2. Traitement Backend (ServiceController)

```php
public function store(Request $request)
{
    // 1. Récupérer l'ID de l'utilisateur authentifié
    $intervenantId = $request->user()->id;

    // 2. Valider les données
    $validated = $request->validate([
        'type_service' => 'required|in:electricite,peinture,menuiserie',
        'titre' => 'required|string|max:150',
        'categories' => 'required|array|min:1',
        // ... autres validations
    ]);

    // 3. Vérifier la limite de 2 services par intervenant
    $count = Service::where('intervenant_id', $intervenantId)->count();
    if ($count >= 2) {
        return response()->json([
            'success' => false,
            'message' => 'Limite de 2 services atteinte'
        ], 422);
    }

    // 4. Créer le service
    $service = Service::create([
        'intervenant_id' => $intervenantId,
        'type_service' => $validated['type_service'],
        'titre' => $validated['titre'],
        // ... autres champs
    ]);

    // 5. Créer les entrées dans la table pivot
    foreach ($validated['categories'] as $cat) {
        ServiceCategorie::create([
            'service_id' => $service->id,
            'category_id' => $cat['category_id'],
            'prix' => $cat['prix'],
            'unite_prix' => $cat['unite_prix']
        ]);
    }

    // 6. Charger les relations pour la réponse
    $service->load(['intervenant', 'serviceCategories.categorie']);

    // 7. Retourner la réponse
    return response()->json([
        'success' => true,
        'message' => 'Service créé avec succès',
        'data' => $service
    ], 201);
}
```

### 3. Réponse JSON

```json
{
  "success": true,
  "message": "Service créé avec succès",
  "data": {
    "id": 15,
    "intervenant_id": 4,
    "type_service": "menuiserie",
    "titre": "Fabrication de meubles sur mesure",
    "ville": "Kenitra",
    "intervenant": {
      "id": 4,
      "nom": "Lyamani",
      "prenom": "Ismail"
    },
    "serviceCategories": [
      {
        "id": 28,
        "service_id": 15,
        "category_id": 1,
        "prix": 150,
        "unite_prix": "par_heure",
        "categorie": {
          "id": 1,
          "nom": "Installation de placards"
        }
      }
    ]
  }
}
```

---

## 🔒 Sécurité

### 1. Validation des Données
- Utilisation de `$request->validate()` pour toutes les entrées
- Règles strictes (required, email, max, min, exists, etc.)
- Protection contre les injections SQL via Eloquent ORM

### 2. Authentification
- Tokens sécurisés générés par Sanctum
- Middleware `auth:sanctum` sur routes protégées
- Tokens stockés hashés en base de données

### 3. Autorisation
- Vérification que l'utilisateur authentifié est propriétaire des ressources
- Exemple: Un intervenant ne peut modifier que ses propres services

### 4. CORS
- Configuration dans `config/cors.php`
- Autorise uniquement le frontend (localhost:5173 en dev)

---

## 📈 Points Forts de l'Architecture

### 1. **Modularité**
- Controllers organisés par domaine métier (Auth, Artisan, Client, etc.)
- Facilite la maintenance et l'évolution

### 2. **RESTful Design**
- Utilisation correcte des verbes HTTP (GET, POST, PUT, PATCH, DELETE)
- URLs sémantiques et cohérentes
- Codes de statut HTTP appropriés (200, 201, 401, 422, etc.)

### 3. **Séparation Frontend/Backend**
- API stateless (sans état)
- Frontend peut être remplacé sans toucher au backend
- Possibilité d'avoir plusieurs clients (Web, Mobile)

### 4. **Scalabilité**
- Architecture permettant l'ajout facile de nouvelles fonctionnalités
- Possibilité d'ajouter des queues, cache, etc.

### 5. **Sécurité**
- Authentification robuste avec Sanctum
- Validation stricte des données
- Protection CSRF et CORS

---

## 🎯 Cas d'Usage Complets

### Scénario 1: Client cherche un électricien

1. **Frontend:** `GET /api/search?type_service=electricite&ville=Kenitra`
2. **Backend:** Recherche dans la base de données
3. **Réponse:** Liste des services d'électricité à Kenitra

### Scénario 2: Client envoie une demande

1. **Frontend:** `POST /api/demandes` (avec token)
2. **Backend:** Crée la demande, notifie l'artisan
3. **Réponse:** Confirmation de la demande

### Scénario 3: Artisan accepte la mission

1. **Frontend:** `PATCH /api/missions/{id}/accept` (avec token)
2. **Backend:** Met à jour le statut, notifie le client
3. **Réponse:** Mission acceptée

---

## 🚀 Technologies Utilisées

- **Laravel 10:** Framework PHP moderne et robuste
- **Eloquent ORM:** Gestion élégante de la base de données
- **Laravel Sanctum:** Authentification API simple et sécurisée
- **MySQL:** Base de données relationnelle
- **Migrations:** Versioning de la structure de la base de données
- **Seeders:** Données de test pour le développement

---

## 📝 Conclusion

Cette architecture backend offre:
- ✅ **Sécurité:** Authentification robuste et validation stricte
- ✅ **Performance:** ORM optimisé et requêtes efficaces
- ✅ **Maintenabilité:** Code organisé et modulaire
- ✅ **Évolutivité:** Facile d'ajouter de nouvelles fonctionnalités
- ✅ **Standards:** Respect des bonnes pratiques REST et Laravel
