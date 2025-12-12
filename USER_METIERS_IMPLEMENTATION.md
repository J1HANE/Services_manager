# User Métiers System - Implementation Summary

## Overview

This document summarizes the changes made to implement the new `metiers` and `user_metiers` tables, allowing each user to have 1 or 2 métiers (professions) assigned to them.

---

## Database Structure

### Tables Created

#### 1. `metiers` Table
Stores the available professions/trades.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `nom` | string(50) | Display name (e.g., "Menuisier") |
| `code` | string(20) | Unique code (e.g., "menuisier") |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

**Default Métiers:**
- Menuisier (code: `menuisier`)
- Peintre (code: `peintre`)
- Électricien (code: `electricien`)

#### 2. `user_metiers` Table
Pivot table linking users to their métiers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | foreignId | References `users.id` |
| `metier_id` | foreignId | References `metiers.id` |
| `principal` | boolean | Is this the primary métier? (default: true) |
| `ordre` | integer | Display order (1 or 2) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

**Constraints:**
- Unique constraint on `(user_id, metier_id)` - prevents duplicate assignments
- Cascade delete on both foreign keys
- Indexed on `user_id` and `metier_id` for performance

---

## Files Created

### 1. **Metier Model**
**Path:** `backend/app/Models/Metier.php`

```php
class Metier extends Model
{
    protected $fillable = ['nom', 'code'];
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_metiers')
            ->withPivot('principal', 'ordre')
            ->withTimestamps();
    }
}
```

### 2. **UserMetierSeeder**
**Path:** `backend/database/seeders/UserMetierSeeder.php`

**Purpose:** Assigns métiers to test intervenants.

**Assignments:**
- `intervenant@test.com`:
  - Électricien (principal, ordre: 1)
  - Menuisier (secondaire, ordre: 2)
  
- `ismail.lyamani@test.com`:
  - Peintre (principal, ordre: 1)

---

## Files Modified

### 1. **User Model**
**Path:** `backend/app/Models/User.php`

**Added Methods:**

```php
// Get all métiers for a user (ordered by ordre)
public function metiers()
{
    return $this->belongsToMany(Metier::class, 'user_metiers')
        ->withPivot('principal', 'ordre')
        ->withTimestamps()
        ->orderBy('ordre');
}

// Get only the principal métier
public function metierPrincipal()
{
    return $this->belongsToMany(Metier::class, 'user_metiers')
        ->wherePivot('principal', true)
        ->withPivot('principal', 'ordre')
        ->withTimestamps();
}
```

### 2. **ServiceSeeder**
**Path:** `backend/database/seeders/ServiceSeeder.php`

**Changes:**
- Added métier verification before creating services
- Only creates services for which the intervenant has the corresponding métier
- Provides informative messages about created/skipped services

**Logic:**
```php
$intervenantMetiers = $intervenant->metiers()->pluck('code')->toArray();

if (in_array('electricien', $intervenantMetiers)) {
    // Create electricite service
}

if (in_array('menuisier', $intervenantMetiers)) {
    // Create menuiserie service
}

if (in_array('peintre', $intervenantMetiers)) {
    // Create peinture service
}
```

### 3. **DatabaseSeeder**
**Path:** `backend/database/seeders/DatabaseSeeder.php`

**Updated Seeding Order:**
```php
$this->call([
    UserSeeder::class,           // 1. Create users
    CategorieSeeder::class,      // 2. Create categories
    UserMetierSeeder::class,     // 3. Assign métiers to users
]);
```

---

## Migration

The migration file `2025_12_12_153936_existing_user_metiers.php` handles:

1. ✅ Creating the `metiers` table
2. ✅ Creating the `user_metiers` pivot table
3. ✅ Inserting default métiers (Menuisier, Peintre, Électricien)
4. ✅ Setting up proper foreign key constraints
5. ✅ Adding indexes for performance

---

## Usage Examples

### Assign a Métier to a User

```php
use App\Models\User;
use App\Models\Metier;

$user = User::find(1);
$electricien = Metier::where('code', 'electricien')->first();

// Assign as principal métier
$user->metiers()->attach($electricien->id, [
    'principal' => true,
    'ordre' => 1
]);

// Assign second métier
$menuisier = Metier::where('code', 'menuisier')->first();
$user->metiers()->attach($menuisier->id, [
    'principal' => false,
    'ordre' => 2
]);
```

### Get User's Métiers

```php
// Get all métiers
$metiers = $user->metiers; // Returns Collection

// Get métier codes
$codes = $user->metiers()->pluck('code')->toArray();
// Returns: ['electricien', 'menuisier']

// Get principal métier only
$principal = $user->metierPrincipal()->first();
```

### Check if User Has a Specific Métier

```php
$hasElectricien = $user->metiers()
    ->where('code', 'electricien')
    ->exists();
```

---

## Business Rules

1. **Maximum 2 Métiers per User**
   - Enforced at the application level
   - First métier is marked as `principal = true`
   - Second métier is marked as `principal = false`

2. **Métier-Service Relationship**
   - Services can only be created for métiers the user possesses
   - `type_service` in services table maps to métier codes:
     - `electricite` → `electricien`
     - `peinture` → `peintre`
     - `menuiserie` → `menuisier`

3. **Seeding Order**
   - Users must be created first
   - Métiers are created by migration
   - User-métier assignments happen before service creation
   - Services are created based on assigned métiers

---

## Testing the Implementation

### 1. Run Migrations

```bash
cd backend
php artisan migrate:fresh
```

### 2. Run Seeders

```bash
php artisan db:seed
```

**Expected Output:**
```
✓ Users seeded successfully!
✓ Categories seeded successfully!
✓ Assigned métiers to intervenant@test.com: Électricien (principal), Menuisier
✓ Assigned métier to ismail.lyamani@test.com: Peintre (principal)
✓ User métiers seeded successfully!
  - Total assignments: 3
  - Users with métiers: 2
```

### 3. Verify in Database

```sql
-- Check métiers
SELECT * FROM metiers;

-- Check user-métier assignments
SELECT 
    u.email,
    m.nom as metier,
    um.principal,
    um.ordre
FROM user_metiers um
JOIN users u ON um.user_id = u.id
JOIN metiers m ON um.metier_id = m.id
ORDER BY u.id, um.ordre;

-- Check services created
SELECT 
    u.email,
    s.type_service,
    s.titre
FROM services s
JOIN users u ON s.intervenant_id = u.id;
```

---

## API Integration

When returning user data, you can include their métiers:

```php
// In a controller
$user = User::with('metiers')->find($id);

return response()->json([
    'user' => $user,
    'metiers' => $user->metiers->map(function($metier) {
        return [
            'id' => $metier->id,
            'nom' => $metier->nom,
            'code' => $metier->code,
            'principal' => $metier->pivot->principal,
            'ordre' => $metier->pivot->ordre,
        ];
    })
]);
```

---

## Summary

✅ **Created:**
- `Metier` model
- `UserMetierSeeder` seeder
- Database migration for `metiers` and `user_metiers` tables

✅ **Modified:**
- `User` model (added métier relationships)
- `ServiceSeeder` (conditional service creation based on métiers)
- `DatabaseSeeder` (updated seeding order)

✅ **Business Logic:**
- Users can have 1-2 métiers maximum
- First métier is marked as principal
- Services are only created for métiers the user possesses
- Proper data integrity with foreign key constraints

---

**Last Updated:** December 12, 2025  
**Version:** 1.0
