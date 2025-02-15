<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Branch;
use App\Models\ItemUnit;
use App\Models\UserRole;
use App\Models\FinSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        UserRole::create([
            'name' => 'Super User',
            'code' => 'superuser',
            'privilege_index' => 10000,
        ]);
        UserRole::create([
            'name' => 'Administrator',
            'code' => 'admin',
            'privilege_index' => 100,
        ]);
        UserRole::create([
            'name' => 'Manager',
            'code' => 'manager',
            'privilege_index' => 10,
        ]);
        
        // Branch
        Branch::create([
            'name' => 'KAMLA WAREHOUSING',
            'gstin' => '18ACVPA9671J1ZV',
            'state' => 'Assam',
            'district' => 'Jorhat',
            'city' => 'Jorhat',
            'location' => 'A. T. Road, Borpul',
            'pin' => ''
        ]);

        Branch::create([
            'name' => 'RAM SUPPLY CHAIN PVT. LTD',
            'gstin' => '08AAMCR5085K1ZP',
            'state' => 'Rajasthan',
            'district' => 'Bikaner',
            'city' => 'Bikaner',
            'location' => 'E39-42, Bichhwal Industrial Area',
            'pin' => '334001'
        ]);

        Branch::create([
            'name' => 'RAM SUPPLY CHAIN PVT. LTD',
            'gstin' => '',
            'state' => 'Assam',
            'district' => 'Kamrup',
            'city' => 'Guwahati',
            'location' => 'House No 11, 2nd floor, B.R. Phookon Road, Kumarpara',
            'pin' => ''
        ]);


        User::create([
            'name' => 'Admin (Kamla)',
            'email' => 'admin@kamla.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'user_role_id' => 2,
            'branch_id' => 1,
        ]);

        User::create([
            'name' => 'Admin (Rajasthan)',
            'email' => 'admin@rscpl-rj.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'user_role_id' => 2,
            'branch_id' => 2,
        ]);
       

        FinSession::create([
            'start_date' => '2023-04-01',
            'end_date' => '2024-03-31',
            'active' => 0,
        ]);
        FinSession::create([
            'start_date' => '2024-04-01',
            'end_date' => '2025-03-31',
            'active' => 1,
        ]);

        ItemUnit::create([
            'name' => 'KG',
            'active' => 1,
        ]);
    }
}
