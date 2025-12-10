<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Email: admin@artizan.com / client@test.com / intervenant@test.com
     * Password: password123
     */
    public function run(): void
    {
        $users = [
            // COMPTE ADMIN (OBLIGATOIRE)
            [
                'email' => 'admin@artizan.com',
                'nom' => 'Admin',
                'prenom' => 'Artizan',
                'mot_de_passe' => '$2y$12$Nkus8iU.vrccKrsB49iRNO8ZK/q0RU9OzfNWD9JtyzgWA.63huwSy', // password123
                'role' => 'admin',
                'telephone' => '0600000000',
                'est_verifie' => true,
            ],
            // COMPTE CLIENT DE TEST
            [
                'email' => 'client@test.com',
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'mot_de_passe' => '$2y$12$Nkus8iU.vrccKrsB49iRNO8ZK/q0RU9OzfNWD9JtyzgWA.63huwSy', // password123
                'role' => 'client',
                'telephone' => '0612345678',
                'est_verifie' => true,
            ],
            // COMPTE INTERVENANT DE TEST
            [
                'email' => 'intervenant@test.com',
                'nom' => 'Leblanc',
                'prenom' => 'Marc',
                'mot_de_passe' => '$2y$12$Nkus8iU.vrccKrsB49iRNO8ZK/q0RU9OzfNWD9JtyzgWA.63huwSy', // password123
                'role' => 'intervenant',
                'telephone' => '0698765432',
                'est_verifie' => true,
                'note_moyenne' => 4.80,
                'nb_avis' => 12,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✓ Users seeded successfully!');
    }
}
