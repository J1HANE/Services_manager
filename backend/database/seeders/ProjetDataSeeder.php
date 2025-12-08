<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ProjetDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. UTILISATEURS (Admin, Client, Artisan)
        $password = Hash::make('password123');
        $now = Carbon::now();

        DB::table('users')->insert([
            [
                'nom' => 'Admin',
                'prenom' => 'Artizan',
                'email' => 'admin@artizan.com',
                'mot_de_passe' => $password,
                'role' => 'admin',
                'telephone' => '0600000000',
                'est_verifie' => true,
                'note_moyenne' => 0, // Ajouté pour uniformiser la structure
                'nb_avis' => 0,      // Ajouté pour uniformiser la structure
                'surnom' => null,
                'photo_profil' => null,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'email' => 'client@test.com',
                'mot_de_passe' => $password,
                'role' => 'client',
                'telephone' => '0612345678',
                'est_verifie' => true,
                'note_moyenne' => 0, // Ajouté pour uniformiser la structure
                'nb_avis' => 0,      // Ajouté pour uniformiser la structure
                'surnom' => null,
                'photo_profil' => null,
                'created_at' => $now, 'updated_at' => $now
            ],
            [
                'nom' => 'Leblanc',
                'prenom' => 'Marc',
                'email' => 'intervenant@test.com',
                'mot_de_passe' => $password,
                'role' => 'intervenant',
                'telephone' => '0698765432',
                'est_verifie' => true,
                'note_moyenne' => 4.80,
                'nb_avis' => 12,
                'surnom' => 'MarcoRenov',
                'photo_profil' => null,
                'created_at' => $now, 'updated_at' => $now
            ]
        ]);

        // 2. CATEGORIES - MENUISERIE
        $menuiserieCategories = [
            ['materiel', 'Chêne', 'Bois de chêne - Qualité premium'],
            ['materiel', 'Pin', 'Bois de pin - Économique et résistant'],
            ['materiel', 'Hêtre', 'Bois de hêtre - Durable et élégant'],
            ['materiel', 'Châtaignier', 'Bois de châtaignier - Rustique'],
            ['materiel', 'Bois exotique', 'Bois exotique - Luxueux et unique'],
            ['service', 'Vernis', 'Application de vernis protecteur'],
            ['service', 'Huile', 'Traitement à l\'huile naturelle'],
            ['service', 'Lasure', 'Application de lasure'],
            ['service', 'Peinture', 'Peinture sur bois'],
            ['service', 'Cire', 'Finition à la cire naturelle'],
            ['service', 'Meuble sur mesure', 'Fabrication de meubles personnalisés'],
            ['service', 'Pose de parquet', 'Installation de parquet'],
            ['service', 'Portes et fenêtres', 'Fabrication et pose de portes/fenêtres'],
            ['service', 'Agencement intérieur', 'Agencement sur mesure'],
            ['service', 'Rénovation meubles', 'Restauration de meubles anciens'],
            ['service', 'Escalier', 'Fabrication d\'escaliers'],
            ['service', 'Menuiserie extérieure', 'Terrasses, pergolas'],
        ];

        foreach ($menuiserieCategories as $cat) {
            DB::table('categories')->insert([
                'type_service' => 'menuiserie',
                'type_categorie' => $cat[0],
                'nom' => $cat[1],
                'description' => $cat[2],
                'created_at' => $now, 'updated_at' => $now
            ]);
        }

        // 3. CATEGORIES - ELECTRICITÉ
        $elecCategories = [
            ['service', 'Installation neuve', 'Installation électrique complète'],
            ['service', 'Rénovation', 'Mise aux normes électriques'],
            ['service', 'Dépannage', 'Réparation de pannes électriques'],
            ['service', 'Tableau électrique', 'Installation/rénovation tableau'],
            ['service', 'Éclairage', 'Installation système d\'éclairage'],
            ['service', 'Prises et interrupteurs', 'Installation prises/interrupteurs'],
            ['service', 'Domotique', 'Installation système domotique'],
            ['service', 'Mise aux normes NF C 15-100', 'Conformité réglementaire'],
            ['materiel', 'Matériel standard', 'Équipement électrique standard'],
            ['materiel', 'Matériel haut de gamme', 'Équipement premium'],
        ];

        foreach ($elecCategories as $cat) {
            DB::table('categories')->insert([
                'type_service' => 'electricite',
                'type_categorie' => $cat[0],
                'nom' => $cat[1],
                'description' => $cat[2],
                'created_at' => $now, 'updated_at' => $now
            ]);
        }

        // 4. CATEGORIES - PEINTURE
        $peintureCategories = [
            ['materiel', 'Peinture acrylique', 'Peinture acrylique - Intérieur'],
            ['materiel', 'Peinture glycéro', 'Peinture glycérophtalique - Extérieur'],
            ['materiel', 'Peinture écologique', 'Peinture bio/écologique'],
            ['service', 'Finition mate', 'Peinture mate'],
            ['service', 'Finition satinée', 'Peinture satinée'],
            ['service', 'Finition brillante', 'Peinture brillante'],
            ['service', 'Peinture intérieure', 'Murs et plafonds intérieurs'],
            ['service', 'Peinture extérieure', 'Façades et volets'],
            ['service', 'Papier peint', 'Pose de papier peint'],
            ['service', 'Toile de verre', 'Pose de toile de verre'],
            ['service', 'Préparation surfaces', 'Rebouchage, ponçage'],
            ['service', 'Traitement anti-humidité', 'Traitement spécialisé'],
        ];

        foreach ($peintureCategories as $cat) {
            DB::table('categories')->insert([
                'type_service' => 'peinture',
                'type_categorie' => $cat[0],
                'nom' => $cat[1],
                'description' => $cat[2],
                'created_at' => $now, 'updated_at' => $now
            ]);
        }
    }
}