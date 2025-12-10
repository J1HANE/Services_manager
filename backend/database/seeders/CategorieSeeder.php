<?php
/**
 * Seeder 3: CategorieSeeder.php
 * database/seeders/CategorieSeeder.php
 *
 * php artisan make:seeder CategorieSeeder
 */
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categorie;

class CategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // =====================================================
            // CATÉGORIES MENUISERIE
            // =====================================================

            // Matériaux
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'materiel',
                'nom' => 'Chêne',
                'description' => 'Bois de chêne - Qualité premium',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'materiel',
                'nom' => 'Pin',
                'description' => 'Bois de pin - Économique et résistant',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'materiel',
                'nom' => 'Hêtre',
                'description' => 'Bois de hêtre - Durable et élégant',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'materiel',
                'nom' => 'Châtaignier',
                'description' => 'Bois de châtaignier - Rustique',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'materiel',
                'nom' => 'Bois exotique',
                'description' => 'Bois exotique - Luxueux et unique',
            ],

            // Finitions
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Vernis',
                'description' => 'Application de vernis protecteur',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Huile',
                'description' => 'Traitement à l\'huile naturelle',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Lasure',
                'description' => 'Application de lasure',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Peinture',
                'description' => 'Peinture sur bois',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Cire',
                'description' => 'Finition à la cire naturelle',
            ],

            // Services menuiserie
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Meuble sur mesure',
                'description' => 'Fabrication de meubles personnalisés',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Pose de parquet',
                'description' => 'Installation de parquet',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Portes et fenêtres',
                'description' => 'Fabrication et pose de portes/fenêtres',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Agencement intérieur',
                'description' => 'Agencement sur mesure',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Rénovation meubles',
                'description' => 'Restauration de meubles anciens',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Escalier',
                'description' => 'Fabrication d\'escaliers',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Menuiserie extérieure',
                'description' => 'Terrasses, pergolas',
            ],

            // =====================================================
            // CATÉGORIES ÉLECTRICITÉ
            // =====================================================

            // Types d'installation
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Installation neuve',
                'description' => 'Installation électrique complète',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Rénovation',
                'description' => 'Mise aux normes électriques',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Dépannage',
                'description' => 'Réparation de pannes électriques',
            ],

            // Services spécifiques
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Tableau électrique',
                'description' => 'Installation/rénovation tableau',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Éclairage',
                'description' => 'Installation système d\'éclairage',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Prises et interrupteurs',
                'description' => 'Installation prises/interrupteurs',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Domotique',
                'description' => 'Installation système domotique',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Mise aux normes NF C 15-100',
                'description' => 'Conformité réglementaire',
            ],

            // Matériel électrique
            [
                'type_service' => 'electricite',
                'type_categorie' => 'materiel',
                'nom' => 'Matériel standard',
                'description' => 'Équipement électrique standard',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'materiel',
                'nom' => 'Matériel haut de gamme',
                'description' => 'Équipement premium',
            ],

            // =====================================================
            // CATÉGORIES PEINTURE
            // =====================================================

            // Types de peinture
            [
                'type_service' => 'peinture',
                'type_categorie' => 'materiel',
                'nom' => 'Peinture acrylique',
                'description' => 'Peinture acrylique - Intérieur',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'materiel',
                'nom' => 'Peinture glycéro',
                'description' => 'Peinture glycérophtalique - Extérieur',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'materiel',
                'nom' => 'Peinture écologique',
                'description' => 'Peinture bio/écologique',
            ],

            // Finitions
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Finition mate',
                'description' => 'Peinture mate',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Finition satinée',
                'description' => 'Peinture satinée',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Finition brillante',
                'description' => 'Peinture brillante',
            ],

            // Services peinture
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture intérieure',
                'description' => 'Murs et plafonds intérieurs',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture extérieure',
                'description' => 'Façades et volets',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Papier peint',
                'description' => 'Pose de papier peint',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Toile de verre',
                'description' => 'Pose de toile de verre',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Préparation surfaces',
                'description' => 'Rebouchage, ponçage',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Traitement anti-humidité',
                'description' => 'Traitement spécialisé',
            ],
        ];

        // Insert all categories
        foreach ($categories as $category) {
            Categorie::create($category);
        }

        $this->command->info('✓ Categories seeded successfully!');
        $this->command->info('  - Menuiserie: 17 categories');
        $this->command->info('  - Électricité: 10 categories');
        $this->command->info('  - Peinture: 12 categories');
        $this->command->info('  Total: 39 categories');
    }
}
