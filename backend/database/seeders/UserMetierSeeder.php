<?php

namespace Database\Seeders;

use App\Models\Metier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserMetierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Assigns métiers to users (intervenants):
     * - Each intervenant can have 1 or 2 métiers maximum
     * - The first métier is marked as 'principal'
     */
    public function run(): void
    {
        // Get all métiers
        $menuisier = Metier::where('code', 'menuisier')->first();
        $peintre = Metier::where('code', 'peintre')->first();
        $electricien = Metier::where('code', 'electricien')->first();

        if (!$menuisier || !$peintre || !$electricien) {
            $this->command->error('❌ Métiers not found! Make sure the migration has run and inserted the métiers.');
            return;
        }

        // Get intervenants
        $intervenantTest = User::where('email', 'intervenant@test.com')->first();
        $intervenantIsmail = User::where('email', 'ismail.lyamani@test.com')->first();

        if (!$intervenantTest) {
            $this->command->error('❌ Intervenant not found! Please run UserSeeder first.');
            return;
        }

        // =====================================================
        // ASSIGN MÉTIERS TO INTERVENANTS
        // =====================================================

        // Intervenant Test: Électricien (principal) + Menuisier (secondaire)
        DB::table('user_metiers')->insert([
            [
                'user_id' => $intervenantTest->id,
                'metier_id' => $electricien->id,
                'principal' => true,
                'ordre' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $intervenantTest->id,
                'metier_id' => $menuisier->id,
                'principal' => false,
                'ordre' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('✓ Assigned métiers to intervenant@test.com: Électricien (principal), Menuisier');

        // Ismail Lyamani: Peintre (principal) only
        if ($intervenantIsmail) {
            DB::table('user_metiers')->insert([
                [
                    'user_id' => $intervenantIsmail->id,
                    'metier_id' => $peintre->id,
                    'principal' => true,
                    'ordre' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            $this->command->info('✓ Assigned métier to ismail.lyamani@test.com: Peintre (principal)');
        }

        // =====================================================
        // STATISTICS
        // =====================================================
        $totalAssignments = DB::table('user_metiers')->count();
        $usersWithMetiers = DB::table('user_metiers')
            ->distinct('user_id')
            ->count('user_id');

        $this->command->info("✓ User métiers seeded successfully!");
        $this->command->info("  - Total assignments: {$totalAssignments}");
        $this->command->info("  - Users with métiers: {$usersWithMetiers}");
    }
}
