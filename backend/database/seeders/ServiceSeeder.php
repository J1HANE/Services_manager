<?php

namespace Database\Seeders;

use App\Models\Categorie;
use App\Models\Disponibilite;
use App\Models\Service;
use App\Models\ServiceCategorie;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer l'intervenant de test
        $intervenant = User::where('email', 'intervenant@test.com')->first();

        if (!$intervenant) {
            $this->command->error('❌ Intervenant not found! Please run UserSeeder first.');
            return;
        }

        // Vérifier que l'intervenant a des métiers assignés
        $intervenantMetiers = $intervenant->metiers()->pluck('code')->toArray();

        if (empty($intervenantMetiers)) {
            $this->command->error('❌ Intervenant has no métiers assigned! Please run UserMetierSeeder first.');
            return;
        }

        $this->command->info("ℹ Intervenant has métiers: " . implode(', ', $intervenantMetiers));

        $servicesCreated = 0;

        // =====================================================
        // SERVICE 1: ÉLECTRICITÉ - Installation complète
        // =====================================================
        if (in_array('electricien', $intervenantMetiers)) {
            $serviceElectricite = Service::create([
                'intervenant_id' => $intervenant->id,
                'type_service' => 'electricite',
                'titre' => 'Installation électrique complète',
                'description' => 'Expert en installation électrique neuve et rénovation. Mise aux normes NF C 15-100. Intervention rapide et soignée.',
                'est_actif' => true,
                'statut' => 'actif',
                'ville' => 'Paris',
                'adresse' => '123 Avenue des Champs-Élysées',
                'latitude' => 48.8566,
                'longitude' => 2.3522,
                'rayon_km' => 30,
                'parametres_specifiques' => [
                    'certifications' => ['NF C 15-100', 'Qualifelec'],
                    'assurance' => 'RC Pro à jour',
                    'experience_annees' => 10,
                ],
                'nb_avis' => 8,
                'moyenne_note' => 5,
                'moyenne_ponctualite' => 5,
                'moyenne_proprete' => 4,
                'moyenne_qualite' => 5,
            ]);

            // Ajouter des catégories à ce service avec prix
            $categoriesElec = [
                ['nom' => 'Installation neuve', 'prix' => 65.00, 'unite' => 'par_heure'],
                ['nom' => 'Rénovation', 'prix' => 70.00, 'unite' => 'par_heure'],
                ['nom' => 'Dépannage', 'prix' => 80.00, 'unite' => 'par_heure'],
                ['nom' => 'Tableau électrique', 'prix' => 450.00, 'unite' => 'par_unite'],
                ['nom' => 'Éclairage', 'prix' => 120.00, 'unite' => 'par_service'],
                ['nom' => 'Prises et interrupteurs', 'prix' => 45.00, 'unite' => 'par_unite'],
                ['nom' => 'Domotique', 'prix' => 150.00, 'unite' => 'par_heure'],
                ['nom' => 'Matériel standard', 'prix' => 50.00, 'unite' => 'par_unite'],
            ];

            foreach ($categoriesElec as $catData) {
                $categorie = Categorie::where('type_service', 'electricite')
                    ->where('nom', $catData['nom'])
                    ->first();

                if ($categorie) {
                    ServiceCategorie::create([
                        'service_id' => $serviceElectricite->id,
                        'category_id' => $categorie->id,
                        'prix' => $catData['prix'],
                        'unite_prix' => $catData['unite'],
                    ]);
                }
            }

            // Ajouter les disponibilités (Lundi à Vendredi)
            for ($jour = 1; $jour <= 5; $jour++) {
                Disponibilite::create([
                    'service_id' => $serviceElectricite->id,
                    'type_disponibilite' => 'regular',
                    'jour_semaine' => $jour,
                ]);
            }

            // Ajouter une exception (jour férié par exemple)
            Disponibilite::create([
                'service_id' => $serviceElectricite->id,
                'type_disponibilite' => 'exception',
                'date_exclusion' => '2024-12-25',
                'raison' => 'Jour de Noël - Fermé',
            ]);

            $servicesCreated++;
            $this->command->info('✓ Created Électricité service');
        } else {
            $this->command->warn('⊘ Skipped Électricité service (intervenant is not electricien)');
        }

        // =====================================================
        // SERVICE 2: MENUISERIE - Meubles sur mesure
        // =====================================================
        if (in_array('menuisier', $intervenantMetiers)) {
            $serviceMenuiserie = Service::create([
                'intervenant_id' => $intervenant->id,
                'type_service' => 'menuiserie',
                'titre' => 'Menuiserie sur mesure - Artisan qualifié',
                'description' => 'Création de meubles sur mesure, pose de parquet, portes et fenêtres. Travail soigné avec des bois de qualité.',
                'est_actif' => true,
                'statut' => 'actif',
                'ville' => 'Lyon',
                'adresse' => '45 Rue de la République',
                'latitude' => 45.7640,
                'longitude' => 4.8357,
                'rayon_km' => 50,
                'parametres_specifiques' => [
                    'specialites' => ['Meubles sur mesure', 'Parquet', 'Escaliers'],
                    'materiaux' => ['Chêne', 'Hêtre', 'Bois exotique'],
                    'garantie_ans' => 5,
                ],
                'nb_avis' => 4,
                'moyenne_note' => 5,
                'moyenne_ponctualite' => 5,
                'moyenne_proprete' => 5,
                'moyenne_qualite' => 5,
            ]);

            // Ajouter des catégories menuiserie
            $categoriesMenu = [
                ['nom' => 'Meuble sur mesure', 'prix' => 2500.00, 'unite' => 'forfait'],
                ['nom' => 'Pose de parquet', 'prix' => 45.00, 'unite' => 'par_m2'],
                ['nom' => 'Portes et fenêtres', 'prix' => 800.00, 'unite' => 'par_unite'],
                ['nom' => 'Escalier', 'prix' => 3500.00, 'unite' => 'forfait'],
                ['nom' => 'Chêne', 'prix' => 120.00, 'unite' => 'par_m2'],
                ['nom' => 'Pin', 'prix' => 65.00, 'unite' => 'par_m2'],
                ['nom' => 'Vernis', 'prix' => 150.00, 'unite' => 'par_service'],
            ];

            foreach ($categoriesMenu as $catData) {
                $categorie = Categorie::where('type_service', 'menuiserie')
                    ->where('nom', $catData['nom'])
                    ->first();

                if ($categorie) {
                    ServiceCategorie::create([
                        'service_id' => $serviceMenuiserie->id,
                        'category_id' => $categorie->id,
                        'prix' => $catData['prix'],
                        'unite_prix' => $catData['unite'],
                    ]);
                }
            }

            // Disponibilités (Lundi à Samedi)
            for ($jour = 1; $jour <= 6; $jour++) {
                Disponibilite::create([
                    'service_id' => $serviceMenuiserie->id,
                    'type_disponibilite' => 'regular',
                    'jour_semaine' => $jour,
                ]);
            }

            $servicesCreated++;
            $this->command->info('✓ Created Menuiserie service');
        } else {
            $this->command->warn('⊘ Skipped Menuiserie service (intervenant is not menuisier)');
        }

        // =====================================================
        // SERVICE 3: PEINTURE - Intérieur et Extérieur
        // =====================================================
        if (in_array('peintre', $intervenantMetiers)) {
            $servicePeinture = Service::create([
                'intervenant_id' => $intervenant->id,
                'type_service' => 'peinture',
                'titre' => 'Peinture professionnelle - Intérieur & Extérieur',
                'description' => 'Peintre professionnel pour tous vos travaux de peinture. Devis gratuit. Finitions soignées.',
                'est_actif' => true,
                'statut' => 'actif',
                'ville' => 'Marseille',
                'adresse' => '78 La Canebière',
                'latitude' => 43.2965,
                'longitude' => 5.3698,
                'rayon_km' => 25,
                'parametres_specifiques' => [
                    'specialites' => ['Peinture intérieure', 'Façades', 'Papier peint'],
                    'peintures_utilisees' => ['Acrylique', 'Écologique', 'Glycéro'],
                    'devis_gratuit' => true,
                ],
                'nb_avis' => 0,
                'moyenne_note' => 0,
                'moyenne_ponctualite' => 0,
                'moyenne_proprete' => 0,
                'moyenne_qualite' => 0,
            ]);

            // Ajouter des catégories peinture
            $categoriesPeinture = [
                ['nom' => 'Peinture intérieure', 'prix' => 25.00, 'unite' => 'par_m2'],
                ['nom' => 'Peinture extérieure', 'prix' => 35.00, 'unite' => 'par_m2'],
                ['nom' => 'Papier peint', 'prix' => 30.00, 'unite' => 'par_m2'],
                ['nom' => 'Préparation surfaces', 'prix' => 15.00, 'unite' => 'par_m2'],
                ['nom' => 'Peinture acrylique', 'prix' => 45.00, 'unite' => 'par_unite'],
                ['nom' => 'Peinture écologique', 'prix' => 65.00, 'unite' => 'par_unite'],
                ['nom' => 'Finition satinée', 'prix' => 100.00, 'unite' => 'par_service'],
            ];

            foreach ($categoriesPeinture as $catData) {
                $categorie = Categorie::where('type_service', 'peinture')
                    ->where('nom', $catData['nom'])
                    ->first();

                if ($categorie) {
                    ServiceCategorie::create([
                        'service_id' => $servicePeinture->id,
                        'category_id' => $categorie->id,
                        'prix' => $catData['prix'],
                        'unite_prix' => $catData['unite'],
                    ]);
                }
            }

            // Disponibilités (Tous les jours sauf dimanche)
            for ($jour = 1; $jour <= 6; $jour++) {
                Disponibilite::create([
                    'service_id' => $servicePeinture->id,
                    'type_disponibilite' => 'regular',
                    'jour_semaine' => $jour,
                ]);
            }

            // Exception (vacances)
            Disponibilite::create([
                'service_id' => $servicePeinture->id,
                'type_disponibilite' => 'exception',
                'date_exclusion' => '2024-08-15',
                'raison' => 'Congés d\'été',
            ]);

            $servicesCreated++;
            $this->command->info('✓ Created Peinture service');
        } else {
            $this->command->warn('⊘ Skipped Peinture service (intervenant is not peintre)');
        }

        $this->command->info("✓ Services seeded successfully! Created {$servicesCreated} service(s)");
    }
}
