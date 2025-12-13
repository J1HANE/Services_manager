<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'menuiserie', 'nom' => 'Menuiserie'],
            ['code' => 'electricite', 'nom' => 'Électricité'],
            ['code' => 'peinture', 'nom' => 'Peinture'],
        ];

        foreach ($types as $t) {
            ServiceType::updateOrCreate(['code' => $t['code']], ['nom' => $t['nom']]);
        }

        $this->command?->info('✓ Service types seeded successfully!');
    }
}


