# ⚡ QUICK START - Do This Now!

## Problem: "psql is not recognized"

✅ **SOLUTION: Use the PHP migration script instead!**

## Steps (Takes 2 minutes):

### 1️⃣ Edit Database Password (2 files)

**File 1:** `migrations/run_postgresql_migration.php` (lines 17-18)
```php
$user = 'postgres';
$password = 'your_actual_password_here';  // ← Change this!
```

**File 2:** `config/pgPool.php` (line 18)
```php
$password = 'your_actual_password_here';  // ← Change this too!
```

### 2️⃣ Run the Migration

```powershell
cd x:\project_safatiTix-v2\backend
php migrations/run_postgresql_migration.php
```

### 3️⃣ Expected Output

```
========================================
SafariTix PostgreSQL Migration Runner
========================================

✓ Connected successfully!
✓ Migration file loaded
✓ Migration completed successfully!
✓ Table 'subscription_plans' exists
✓ Table 'subscriptions' exists
✓ Table 'subscription_history' exists
✓ All 3 subscription plans created
  - Starter: RWF 50,000 (Max buses: 5)
  - Growth: RWF 150,000 (Max buses: 20)
  - Enterprise: RWF 250,000 (Max buses: Unlimited)

✓✓✓ MIGRATION SUCCESSFUL! ✓✓✓
```

### 4️⃣ Test It

```powershell
php php/test_subscription_system_postgresql.php
```

## 🚨 Still Not Working?

### If database doesn't exist:
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `safatitix`
4. Save

### If PostgreSQL not running:
1. Press `Win + R`
2. Type: `services.msc`
3. Find "postgresql" → Right-click → Start

### If connection fails:
Check username/password in `run_postgresql_migration.php` line 17-18

## 📁 Files Overview

```
✅ Config: config/pgPool.php ← Edit password here too!
✅ Migration SQL: migrations/create-subscriptions-table-postgresql.sql
✅ Migration Runner: migrations/run_postgresql_migration.php ← USE THIS
✅ PHP Class: php/SubscriptionManagerPostgreSQL.php
✅ Examples: php/subscription_examples_postgresql.php
✅ Test: php/test_subscription_system_postgresql.php
✅ Guide: POSTGRESQL_SETUP_GUIDE.md
```

## 🎯 After Migration Works

Use the subscription system in your code:

```php
<?php
require_once 'backend/php/SubscriptionManagerPostgreSQL.php';
require_once 'backend/config/pgPool.php';

$manager = new SubscriptionManager($pgPool);

// Create trial for new user
$result = $manager->createTrialForNewUser($userId, $email);

// Check feature access
$access = $manager->canAccessFeature($userId, 'gps_tracking');
?>
```

## 👉 DO THIS NOW:
1. Open `config/pgPool.php` → Change password on line 18
2. Open `migrations/run_postgresql_migration.php` → Change password on line 18  
3. Run: `php migrations/run_postgresql_migration.php`

Done! 🎉
