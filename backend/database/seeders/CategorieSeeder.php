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

            // Sous-services supplémentaires (objectif: 20 sous-services "service" minimum)
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Pose de cuisine',
                'description' => 'Installation et ajustements de cuisines',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Pose de plinthes et moulures',
                'description' => 'Pose et finitions des plinthes / moulures',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Dressing sur mesure',
                'description' => 'Conception et pose de dressing',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Bibliothèque sur mesure',
                'description' => 'Fabrication et pose de bibliothèque',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Réparation portes et fenêtres',
                'description' => 'Réglage, réparation, remplacement de pièces',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Pose de porte blindée',
                'description' => 'Installation de porte de sécurité',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Isolation et étanchéité menuiseries',
                'description' => 'Jointage, calfeutrage, amélioration thermique/phonique',
            ],
            [
                'type_service' => 'menuiserie',
                'type_categorie' => 'service',
                'nom' => 'Habillage escalier',
                'description' => 'Habillage / rénovation d’escalier (marches, contremarches)',
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

            // Sous-services supplémentaires (objectif: 20 sous-services "service" minimum)
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Mise à la terre',
                'description' => 'Création / réparation de la prise de terre',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Installation prises RJ45',
                'description' => 'Réseau câblé (Ethernet) et baies de brassage',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Installation interphone/visiophone',
                'description' => 'Pose et raccordement interphone/visiophone',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Installation alarme',
                'description' => 'Pose et configuration alarme intrusion',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Installation caméra de surveillance',
                'description' => 'Caméras IP / DVR, câblage et paramétrage',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Dépannage disjoncteur / différentiel',
                'description' => 'Diagnostic et remplacement protections',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Ajout circuit / ligne dédiée',
                'description' => 'Création d’un circuit (four, clim, chauffe-eau, etc.)',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Chauffe-eau électrique',
                'description' => 'Installation / remplacement chauffe-eau',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'VMC',
                'description' => 'Installation / remplacement VMC',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Portail / motorisation',
                'description' => 'Alimentation et raccordement motorisation portail/garage',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Éclairage extérieur',
                'description' => 'Installation éclairage jardin / façade',
            ],
            [
                'type_service' => 'electricite',
                'type_categorie' => 'service',
                'nom' => 'Détection fumée (DAAF)',
                'description' => 'Pose détecteurs de fumée et tests',
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

            // Sous-services supplémentaires (objectif: 20 sous-services "service" minimum)
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture boiseries',
                'description' => 'Portes, plinthes, encadrements, meubles',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture métalliques',
                'description' => 'Garde-corps, portails, grilles (antirouille)',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture plafond',
                'description' => 'Préparation et peinture plafonds',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Ravalement façade',
                'description' => 'Préparation + peinture façade / enduits',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Enduit de lissage',
                'description' => 'Lissage murs/plafonds avant peinture',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Rebouchage fissures',
                'description' => 'Réparation fissures et trous (rebouchage)',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Application sous-couche / primaire',
                'description' => 'Préparation support avec primaire d’accrochage',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture décorative',
                'description' => 'Effets (stuc, tadelakt, béton ciré, etc.)',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Pose toile / fibre de verre (renfort)',
                'description' => 'Renforcement murs et fissures par toile',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Traitement anti-moisissure',
                'description' => 'Nettoyage + traitement fongicide',
            ],
            [
                'type_service' => 'peinture',
                'type_categorie' => 'service',
                'nom' => 'Peinture sol (garage/terrasse)',
                'description' => 'Peinture sols (résines, protections)',
            ],
        ];

        // Insert / update categories without duplicating entries
        foreach ($categories as $category) {
            Categorie::updateOrCreate(
                [
                    'type_service' => $category['type_service'],
                    'type_categorie' => $category['type_categorie'],
                    'nom' => $category['nom'],
                ],
                [
                    'description' => $category['description'] ?? null,
                    'photo' => $category['photo'] ?? null,
                ]
            );
        }

        $this->command->info('✓ Categories seeded successfully!');
        $this->command->info('  - Menuiserie: ' . Categorie::where('type_service', 'menuiserie')->count() . ' categories');
        $this->command->info('  - Électricité: ' . Categorie::where('type_service', 'electricite')->count() . ' categories');
        $this->command->info('  - Peinture: ' . Categorie::where('type_service', 'peinture')->count() . ' categories');
        $this->command->info('  Total: ' . Categorie::count() . ' categories');
    }
}
