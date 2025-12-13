<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;
use App\Models\SubService;

class SubServiceSeeder extends Seeder
{
    public function run(): void
    {
        $typeMenuiserie = ServiceType::where('code', 'menuiserie')->first();
        $typeElectricite = ServiceType::where('code', 'electricite')->first();
        $typePeinture = ServiceType::where('code', 'peinture')->first();

        if (!$typeMenuiserie || !$typeElectricite || !$typePeinture) {
            $this->command?->error('❌ Missing service types. Run ServiceTypeSeeder first.');
            return;
        }

        $subServicesByType = [
            'menuiserie' => [
                ['nom' => 'Meuble sur mesure', 'description' => 'Fabrication de meubles personnalisés'],
                ['nom' => 'Pose de parquet', 'description' => 'Installation de parquet (massif/stratifié)'],
                ['nom' => 'Portes intérieures', 'description' => 'Pose/remplacement portes intérieures'],
                ['nom' => 'Portes extérieures', 'description' => 'Pose/remplacement portes extérieures'],
                ['nom' => 'Fenêtres', 'description' => 'Pose/remplacement fenêtres'],
                ['nom' => 'Placards sur mesure', 'description' => 'Conception/pose de placards'],
                ['nom' => 'Dressing sur mesure', 'description' => 'Conception/pose de dressing'],
                ['nom' => 'Cuisine (pose)', 'description' => 'Installation et ajustements de cuisines'],
                ['nom' => 'Escalier', 'description' => 'Fabrication/pose/rénovation d’escalier'],
                ['nom' => 'Terrasse bois', 'description' => 'Construction/pose terrasse en bois'],
                ['nom' => 'Pergola / abri', 'description' => 'Fabrication et pose pergola/abri'],
                ['nom' => 'Agencement intérieur', 'description' => 'Agencement sur mesure (cloisons, rangements)'],
                ['nom' => 'Bibliothèque sur mesure', 'description' => 'Fabrication/pose bibliothèque'],
                ['nom' => 'Habillage mur / lambris', 'description' => 'Lambris, parements bois'],
                ['nom' => 'Plinthes et moulures', 'description' => 'Pose et finitions plinthes/moulures'],
                ['nom' => 'Réparation menuiserie', 'description' => 'Réglages, réparations, remplacement pièces'],
                ['nom' => 'Volets', 'description' => 'Pose/réparation volets bois'],
                ['nom' => 'Vernissage', 'description' => 'Application de vernis protecteur'],
                ['nom' => 'Huilage', 'description' => 'Traitement à l’huile naturelle'],
                ['nom' => 'Lasure', 'description' => 'Application de lasure (protection)'],
            ],
            'electricite' => [
                ['nom' => 'Installation neuve', 'description' => 'Installation électrique complète'],
                ['nom' => 'Rénovation', 'description' => 'Rénovation / mise aux normes'],
                ['nom' => 'Mise aux normes NF C 15-100', 'description' => 'Conformité réglementaire'],
                ['nom' => 'Dépannage', 'description' => 'Diagnostic et réparation de panne'],
                ['nom' => 'Tableau électrique', 'description' => 'Installation/rénovation tableau'],
                ['nom' => 'Prises et interrupteurs', 'description' => 'Ajout/remplacement prises/interrupteurs'],
                ['nom' => 'Éclairage intérieur', 'description' => 'Installation éclairage intérieur'],
                ['nom' => 'Éclairage extérieur', 'description' => 'Installation éclairage jardin/façade'],
                ['nom' => 'Domotique', 'description' => 'Installation système domotique'],
                ['nom' => 'Chauffage électrique', 'description' => 'Installation radiateurs/convecteurs'],
                ['nom' => 'Chauffe-eau électrique', 'description' => 'Installation/remplacement chauffe-eau'],
                ['nom' => 'VMC', 'description' => 'Installation/remplacement VMC'],
                ['nom' => 'Mise à la terre', 'description' => 'Création/réparation prise de terre'],
                ['nom' => 'Ajout circuit dédié', 'description' => 'Création d’un circuit (four, clim, etc.)'],
                ['nom' => 'RJ45 / réseau', 'description' => 'Prises RJ45, baie de brassage'],
                ['nom' => 'Interphone / visiophone', 'description' => 'Pose et raccordement'],
                ['nom' => 'Alarme', 'description' => 'Pose et configuration alarme intrusion'],
                ['nom' => 'Caméras de surveillance', 'description' => 'Installation caméras IP / DVR'],
                ['nom' => 'Portail / motorisation', 'description' => 'Raccordement motorisation portail/garage'],
                ['nom' => 'Détecteur de fumée (DAAF)', 'description' => 'Pose détecteurs et tests'],
            ],
            'peinture' => [
                ['nom' => 'Peinture intérieure', 'description' => 'Murs et plafonds intérieurs'],
                ['nom' => 'Peinture extérieure', 'description' => 'Façades, volets, extérieurs'],
                ['nom' => 'Peinture plafond', 'description' => 'Préparation et peinture plafonds'],
                ['nom' => 'Peinture boiseries', 'description' => 'Portes, plinthes, encadrements'],
                ['nom' => 'Peinture métalliques', 'description' => 'Portails, grilles (antirouille)'],
                ['nom' => 'Enduit de lissage', 'description' => 'Lissage murs/plafonds avant peinture'],
                ['nom' => 'Rebouchage fissures', 'description' => 'Réparation fissures et trous'],
                ['nom' => 'Sous-couche / primaire', 'description' => 'Application primaire d’accrochage'],
                ['nom' => 'Préparation surfaces', 'description' => 'Ponçage, lessivage, protection'],
                ['nom' => 'Papier peint', 'description' => 'Pose de papier peint'],
                ['nom' => 'Toile de verre', 'description' => 'Pose toile/fibre de verre'],
                ['nom' => 'Peinture décorative', 'description' => 'Effets: stuc, béton ciré, etc.'],
                ['nom' => 'Ravalement façade', 'description' => 'Rénovation + peinture façade'],
                ['nom' => 'Traitement anti-humidité', 'description' => 'Traitement spécialisé'],
                ['nom' => 'Traitement anti-moisissure', 'description' => 'Nettoyage + traitement fongicide'],
                ['nom' => 'Peinture sol (garage/terrasse)', 'description' => 'Peinture sols (résines)'],
                ['nom' => 'Vernis / lasure bois', 'description' => 'Protection boiseries'],
                ['nom' => 'Peinture portes/fenêtres', 'description' => 'Mise en peinture menuiseries'],
                ['nom' => 'Peinture façade clôture', 'description' => 'Peinture murs extérieurs/clôtures'],
                ['nom' => 'Finitions (mate/satinée/brillante)', 'description' => 'Choix de finitions'],
            ],
        ];

        $map = [
            'menuiserie' => $typeMenuiserie,
            'electricite' => $typeElectricite,
            'peinture' => $typePeinture,
        ];

        foreach ($subServicesByType as $typeCode => $subs) {
            $type = $map[$typeCode];
            // Keep exactly 20 if someone added extras later
            $subs = array_slice($subs, 0, 20);

            foreach ($subs as $sub) {
                SubService::updateOrCreate(
                    ['service_type_id' => $type->id, 'nom' => $sub['nom']],
                    ['description' => $sub['description'] ?? null]
                );
            }
        }

        $this->command?->info('✓ Sub-services seeded successfully (20 per type).');
    }
}


