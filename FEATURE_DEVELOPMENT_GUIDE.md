# Guide de Développement de Nouvelles Fonctionnalités
## Services Manager - Architecture Full Stack

---

## 🏗️ Technologies Utilisées

### **Backend - Laravel 11 (PHP)**
- **Framework**: Laravel 11 - Framework PHP moderne pour API RESTful
- **Base de données**: MySQL - Système de gestion de base de données relationnelle
- **ORM**: Eloquent - Object-Relational Mapping pour interactions avec la base de données
- **Migrations**: Système de versioning de schéma de base de données
- **Seeders**: Peuplement de données de test
- **Storage**: Laravel Storage pour gestion de fichiers uploadés

### **Frontend - React + Vite**
- **Framework**: React 18 - Bibliothèque JavaScript pour interfaces utilisateur
- **Build Tool**: Vite - Outil de build rapide et moderne
- **Routing**: React Router DOM - Navigation côté client
- **Styling**: Tailwind CSS - Framework CSS utility-first
- **Icons**: Lucide React - Bibliothèque d'icônes modernes
- **Maps**: React Leaflet - Cartes interactives avec OpenStreetMap
- **HTTP Client**: Fetch API - Requêtes HTTP natives

### **Architecture**
- **Pattern**: MVC (Model-View-Controller) côté backend
- **API**: RESTful API avec JSON
- **Authentication**: Laravel Sanctum (prévu)
- **State Management**: React Hooks (useState, useEffect, useMemo)

---

## 📋 Processus Étape par Étape pour Ajouter une Nouvelle Fonctionnalité

### **Exemple Pratique**: Ajouter un système de messagerie entre clients et artisans

---

## **ÉTAPE 1: Planification et Analyse** 📝

### 1.1 Définir les Besoins
- **Quoi**: Système de messagerie en temps réel
- **Qui**: Clients et Artisans
- **Pourquoi**: Communication directe pour négocier services
- **Comment**: Messages texte avec notifications

### 1.2 Identifier les Données Nécessaires
```
Table: messages
- id (primary key)
- expediteur_id (foreign key -> users)
- destinataire_id (foreign key -> users)
- service_id (foreign key -> services, nullable)
- contenu (text)
- lu (boolean)
- created_at, updated_at
```

---

## **ÉTAPE 2: Backend - Base de Données** 🗄️

### 2.1 Créer la Migration
```bash
# Dans le terminal backend
php artisan make:migration create_messages_table
```

### 2.2 Éditer la Migration
**Fichier**: `backend/database/migrations/YYYY_MM_DD_HHMMSS_create_messages_table.php`

```php
public function up()
{
    Schema::create('messages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('service_id')->nullable()->constrained()->onDelete('set null');
        $table->text('contenu');
        $table->boolean('lu')->default(false);
        $table->timestamps();
        
        // Index pour performance
        $table->index(['expediteur_id', 'destinataire_id']);
        $table->index('created_at');
    });
}
```

### 2.3 Exécuter la Migration
```bash
php artisan migrate
```

---

## **ÉTAPE 3: Backend - Modèle Eloquent** 🎯

### 3.1 Créer le Modèle
```bash
php artisan make:model Message
```

### 3.2 Définir le Modèle
**Fichier**: `backend/app/Models/Message.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'service_id',
        'contenu',
        'lu'
    ];

    protected $casts = [
        'lu' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function expediteur()
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
```

### 3.3 Mettre à Jour le Modèle User
**Fichier**: `backend/app/Models/User.php`

```php
public function messagesEnvoyes()
{
    return $this->hasMany(Message::class, 'expediteur_id');
}

public function messagesRecus()
{
    return $this->hasMany(Message::class, 'destinataire_id');
}
```

---

## **ÉTAPE 4: Backend - Contrôleur API** 🎮

### 4.1 Créer le Contrôleur
```bash
php artisan make:controller API/MessageController
```

### 4.2 Implémenter les Méthodes
**Fichier**: `backend/app/Http/Controllers/API/MessageController.php`

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Récupérer les conversations de l'utilisateur
     * GET /api/messages/conversations
     */
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;
        
        $conversations = Message::where('expediteur_id', $userId)
            ->orWhere('destinataire_id', $userId)
            ->with(['expediteur', 'destinataire', 'service'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function($message) use ($userId) {
                return $message->expediteur_id === $userId 
                    ? $message->destinataire_id 
                    : $message->expediteur_id;
            });

        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }

    /**
     * Récupérer les messages d'une conversation
     * GET /api/messages/{userId}
     */
    public function getMessages(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;
        
        $messages = Message::where(function($query) use ($currentUserId, $userId) {
            $query->where('expediteur_id', $currentUserId)
                  ->where('destinataire_id', $userId);
        })->orWhere(function($query) use ($currentUserId, $userId) {
            $query->where('expediteur_id', $userId)
                  ->where('destinataire_id', $currentUserId);
        })
        ->with(['expediteur', 'destinataire'])
        ->orderBy('created_at', 'asc')
        ->get();

        // Marquer comme lu
        Message::where('destinataire_id', $currentUserId)
            ->where('expediteur_id', $userId)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Envoyer un message
     * POST /api/messages
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
            'contenu' => 'required|string|max:1000'
        ]);

        $message = Message::create([
            'expediteur_id' => $request->user()->id,
            'destinataire_id' => $validated['destinataire_id'],
            'service_id' => $validated['service_id'] ?? null,
            'contenu' => $validated['contenu'],
            'lu' => false
        ]);

        $message->load(['expediteur', 'destinataire', 'service']);

        return response()->json([
            'success' => true,
            'data' => $message,
            'message' => 'Message envoyé avec succès'
        ], 201);
    }

    /**
     * Marquer un message comme lu
     * PUT /api/messages/{id}/read
     */
    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);
        $message->update(['lu' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }
}
```

---

## **ÉTAPE 5: Backend - Routes API** 🛣️

### 5.1 Ajouter les Routes
**Fichier**: `backend/routes/api.php`

```php
use App\Http\Controllers\API\MessageController;

// Routes protégées (nécessitent authentification)
Route::middleware('auth:sanctum')->group(function () {
    // Messages
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/{userId}', [MessageController::class, 'getMessages']);
    Route::post('/messages', [MessageController::class, 'sendMessage']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
});
```

---

## **ÉTAPE 6: Frontend - Service API** 🔌

### 6.1 Créer le Service API
**Fichier**: `frontend/src/lib/api/messages.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Récupérer les conversations de l'utilisateur
 */
export async function fetchConversations() {
    try {
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

/**
 * Récupérer les messages d'une conversation
 */
export async function fetchMessages(userId) {
    try {
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE_URL}/messages/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

/**
 * Envoyer un message
 */
export async function sendMessage(messageData) {
    try {
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to send message');
        }

        return result.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
```

---

## **ÉTAPE 7: Frontend - Composant React** ⚛️

### 7.1 Créer le Composant de Messagerie
**Fichier**: `frontend/src/pages/MessagesPage.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import { fetchConversations, fetchMessages, sendMessage } from '../lib/api/messages';

function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Charger les conversations au montage
    useEffect(() => {
        loadConversations();
    }, []);

    // Charger les messages quand un utilisateur est sélectionné
    useEffect(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
        }
    }, [selectedUser]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await fetchConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const data = await fetchMessages(userId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const messageData = {
                destinataire_id: selectedUser.id,
                contenu: newMessage
            };

            const sentMessage = await sendMessage(messageData);
            setMessages([...messages, sentMessage]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Erreur lors de l\'envoi du message');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Liste des conversations */}
            <div className="w-1/3 bg-white border-r overflow-y-auto">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                </div>
                
                {loading ? (
                    <div className="p-4 text-center">Chargement...</div>
                ) : (
                    <div>
                        {Object.entries(conversations).map(([userId, msgs]) => {
                            const lastMessage = msgs[0];
                            const otherUser = lastMessage.expediteur_id === currentUserId 
                                ? lastMessage.destinataire 
                                : lastMessage.expediteur;
                            
                            return (
                                <div
                                    key={userId}
                                    onClick={() => setSelectedUser(otherUser)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                        selectedUser?.id === otherUser.id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{otherUser.surnom}</h3>
                                            <p className="text-sm text-gray-600 truncate">
                                                {lastMessage.contenu}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Zone de messages */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b">
                            <h3 className="text-xl font-bold">{selectedUser.surnom}</h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => {
                                const isOwn = message.expediteur_id === currentUserId;
                                
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg ${
                                                isOwn
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            <p>{message.contenu}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Tapez votre message..."
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Sélectionnez une conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage;
```

---

## **ÉTAPE 8: Frontend - Routing** 🗺️

### 8.1 Ajouter la Route
**Fichier**: `frontend/src/App.jsx` (ou votre fichier de routing)

```javascript
import MessagesPage from './pages/MessagesPage';

// Dans votre configuration de routes
<Route path="/messages" element={<MessagesPage />} />
```

### 8.2 Ajouter un Lien dans la Navigation
**Fichier**: `frontend/src/components/Header.jsx`

```javascript
<Link to="/messages" className="nav-link">
    <MessageCircle className="w-5 h-5" />
    Messages
</Link>
```

---

## **ÉTAPE 9: Tests** 🧪

### 9.1 Tester l'API Backend
```bash
# Utiliser Postman ou curl
curl -X POST http://localhost:8000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destinataire_id": 2,
    "contenu": "Bonjour, je suis intéressé par votre service"
  }'
```

### 9.2 Tester le Frontend
1. Démarrer le serveur de développement: `npm run dev`
2. Naviguer vers `/messages`
3. Vérifier l'affichage des conversations
4. Envoyer un message de test
5. Vérifier la mise à jour en temps réel

---

## **ÉTAPE 10: Optimisations et Améliorations** ⚡

### 10.1 Ajouter des Seeders pour Tests
**Fichier**: `backend/database/seeders/MessageSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\User;

class MessageSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        
        for ($i = 0; $i < 20; $i++) {
            Message::create([
                'expediteur_id' => $users->random()->id,
                'destinataire_id' => $users->random()->id,
                'contenu' => fake()->sentence(),
                'lu' => fake()->boolean()
            ]);
        }
    }
}
```

### 10.2 Ajouter la Pagination
```php
// Dans le contrôleur
$messages = Message::where(...)
    ->paginate(50);
```

### 10.3 Ajouter le Polling ou WebSockets
```javascript
// Polling simple toutes les 5 secondes
useEffect(() => {
    const interval = setInterval(() => {
        if (selectedUser) {
            loadMessages(selectedUser.id);
        }
    }, 5000);
    
    return () => clearInterval(interval);
}, [selectedUser]);
```

---

## 📚 Résumé des Technologies par Couche

### **Base de Données**
- MySQL pour stockage persistant
- Migrations Laravel pour versioning du schéma
- Eloquent ORM pour requêtes type-safe

### **Backend API**
- Laravel 11 (PHP 8.2+)
- Architecture MVC
- Validation des requêtes
- Relations Eloquent (belongsTo, hasMany)
- Responses JSON standardisées

### **Frontend**
- React 18 avec Hooks (useState, useEffect, useMemo)
- Vite pour build rapide
- Tailwind CSS pour styling
- Fetch API pour requêtes HTTP
- React Router pour navigation

### **Communication**
- API RESTful avec JSON
- Headers d'authentification (Bearer Token)
- CORS configuré côté Laravel

---

## ✅ Checklist Finale

- [ ] Migration créée et exécutée
- [ ] Modèle Eloquent défini avec relations
- [ ] Contrôleur API implémenté
- [ ] Routes API ajoutées
- [ ] Service API frontend créé
- [ ] Composant React développé
- [ ] Route frontend ajoutée
- [ ] Navigation mise à jour
- [ ] Tests effectués
- [ ] Documentation mise à jour
- [ ] Commit Git avec message descriptif

---

## 🎓 Points Clés à Mentionner au Professeur

1. **Séparation des Responsabilités**: Backend (logique métier) vs Frontend (interface)
2. **API RESTful**: Endpoints clairs et standardisés
3. **Sécurité**: Validation des données, authentification
4. **Performance**: Eager loading, pagination, indexation
5. **Maintenabilité**: Code modulaire, réutilisable
6. **UX**: Loading states, error handling, feedback utilisateur
