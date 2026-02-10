# SafariTix Subscription System - PostgreSQL

Complete subscription management system for SafariTix bus ticketing platform using **PostgreSQL**.

## 🚀 Quick Start

```bash
# 1. Run database migration
psql -U username -d safatitix -f backend/migrations/create-subscriptions-table-postgresql.sql

# 2. Test the system
php backend/php/test_subscription_system_postgresql.php

# 3. Setup daily cron job
0 0 * * * php /path/to/backend/php/daily_subscription_update_postgresql.php
```

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Cron Jobs](#cron-jobs)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Subscription Plans

| Plan | Price | Max Buses | Key Features |
|------|-------|-----------|--------------|
| **Starter** | RWF 50,000/month | 5 | Basic ticketing, mobile app, email support |
| **Growth** | RWF 150,000/month | 20 | GPS tracking, driver accounts, analytics, QR scanning |
| **Enterprise** | RWF 250,000/month | Unlimited | API access, white-label, SLA, dedicated support |

### Subscription Statuses

```
TRIAL_ACTIVE    → Trial ongoing (>3 days left)
TRIAL_EXPIRING  → Trial ending soon (≤3 days)
TRIAL_EXPIRED   → Trial ended, payment required
ACTIVE          → Paid subscription active
GRACE_PERIOD    → 7 days after expiry, limited access
EXPIRED         → No access, account suspended
```

### Key Capabilities

✅ **Automatic 14-day trial** for all new users  
✅ **Special test user**: mugisha@gmail.com gets Enterprise ACTIVE (30 days)  
✅ **Automatic status updates** on login and daily cron  
✅ **Feature gating** based on plan and status  
✅ **Bus limit enforcement** (5/20/unlimited)  
✅ **7-day grace period** after expiry  
✅ **Complete audit trail** in subscription_history  
✅ **PostgreSQL native types** (ENUM, ARRAY, SERIAL)  

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Signup                          │
│  Regular User → 14-day Starter Trial                    │
│  mugisha@gmail.com → Enterprise ACTIVE 30 days          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────┐
│              SubscriptionManager                        │
│  • createTrialForNewUser()                              │
│  • checkAndUpdateSubscription()                         │
│  • canAccessFeature()                                   │
│  • canAddBus()                                          │
│  • upgradePlan()                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                        │
│  Tables:                                                │
│   • subscription_plans (Starter/Growth/Enterprise)      │
│   • subscriptions (user subscription records)           │
│   • subscription_history (audit trail)                  │
│                                                         │
│  Custom Types:                                          │
│   • subscription_plan_name (ENUM)                       │
│   • subscription_status (ENUM)                          │
│   • subscription_action (ENUM)                          │
│                                                         │
│  Functions:                                             │
│   • update_subscription_status(user_id)                 │
│                                                         │
│  Triggers:                                              │
│   • after_subscription_update → log to history          │
│   • update_updated_at → auto-update timestamps          │
└─────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Custom PostgreSQL Types

```sql
-- Plan names
CREATE TYPE subscription_plan_name AS ENUM ('Starter', 'Growth', 'Enterprise');

-- Subscription statuses
CREATE TYPE subscription_status AS ENUM (
    'TRIAL_ACTIVE', 'TRIAL_EXPIRING', 'TRIAL_EXPIRED',
    'ACTIVE', 'GRACE_PERIOD', 'EXPIRED'
);

-- Audit actions
CREATE TYPE subscription_action AS ENUM (
    'CREATED', 'UPGRADED', 'DOWNGRADED', 
    'RENEWED', 'CANCELLED', 'EXPIRED', 'STATUS_CHANGED'
);
```

### Tables

#### subscription_plans

```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name subscription_plan_name UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    max_buses INTEGER,  -- NULL = unlimited
    features TEXT[] NOT NULL,  -- PostgreSQL array
    trial_days INTEGER NOT NULL DEFAULT 14,
    grace_period_days INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### subscriptions

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,  -- One per user
    plan_name subscription_plan_name NOT NULL,
    status subscription_status NOT NULL DEFAULT 'TRIAL_ACTIVE',
    is_trial BOOLEAN NOT NULL DEFAULT TRUE,
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    payment_method VARCHAR(50),
    last_payment_amount NUMERIC(10, 2),
    last_payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_subscription_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### subscription_history

```sql
CREATE TABLE subscription_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subscription_id INTEGER,
    action subscription_action NOT NULL,
    old_status subscription_status,
    new_status subscription_status,
    old_plan subscription_plan_name,
    new_plan subscription_plan_name,
    payment_amount NUMERIC(10, 2),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_history_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### PostgreSQL Function

```sql
-- Calculate and update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(p_user_id VARCHAR)
RETURNS TABLE(
    old_status subscription_status,
    new_status subscription_status,
    status_changed BOOLEAN
) AS $$
-- Function body calculates status based on dates
-- Handles trials, expiry, grace period automatically
$$ LANGUAGE plpgsql;
```

## 📦 Installation

### 1. Prerequisites

```bash
# PostgreSQL 12+ required
psql --version

# PHP 7.4+ with PDO PostgreSQL extension
php -m | grep pdo_pgsql
```

### 2. Database Setup

```bash
# Create database
createdb safatitix

# Run migration
psql -U postgres -d safatitix -f backend/migrations/create-subscriptions-table-postgresql.sql
```

### 3. Configure Database Connection

Create `backend/config/pgPool.php`:

```php
<?php
$host = 'localhost';
$port = '5432';
$dbname = 'safatitix';
$user = 'postgres';
$password = 'your_password';

try {
    $pgPool = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
```

### 4. Test Installation

```bash
php backend/php/test_subscription_system_postgresql.php
```

Expected output:
```
✓ Table 'subscription_plans' exists
✓ Table 'subscriptions' exists
✓ Table 'subscription_history' exists
✓ All 3 plans found
✓ Trial subscription created
✓ All Tests Completed!
```

## 💻 Usage Examples

### 1. User Signup with Auto Trial

```php
require_once 'backend/php/SubscriptionManagerPostgreSQL.php';
require_once 'backend/config/pgPool.php';

$subscriptionManager = new SubscriptionManager($pgPool);

// Create user account
$userId = uniqid('user_', true);
$email = 'newuser@example.com';

// Create trial subscription
$result = $subscriptionManager->createTrialForNewUser($userId, $email);

if ($result['success']) {
    // Regular user gets 14-day Starter trial
    echo "Trial created: " . $result['subscription']['plan_name'];
    echo "Status: " . $result['subscription']['status'];
} else {
    echo "Error: " . $result['error'];
}

// Special case: mugisha@gmail.com
$testResult = $subscriptionManager->createTrialForNewUser(
    'test_user_id', 
    'mugisha@gmail.com'
);
// Returns Enterprise ACTIVE for 30 days (not trial)
```

### 2. User Login with Status Check

```php
// On every login, check subscription status
$userId = $_SESSION['user_id'];

$check = $subscriptionManager->checkAndUpdateSubscription($userId);

if ($check['success']) {
    if ($check['status_changed']) {
        // Status changed - notify user
        $oldStatus = $check['old_status'];
        $newStatus = $check['new_status'];
        
        if ($newStatus === 'TRIAL_EXPIRING') {
            showNotification("Your trial expires in 3 days. Upgrade now!");
        } elseif ($newStatus === 'TRIAL_EXPIRED') {
            redirectTo('/subscription/upgrade');
        }
    }
    
    $subscription = $check['subscription'];
    // Continue with login...
}
```

### 3. Feature Gating

```php
// Protect GPS tracking feature
function getGPSData($userId, $busId) {
    global $subscriptionManager;
    
    $access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');
    
    if (!$access['allowed']) {
        return [
            'error' => $access['reason'],
            'upgrade_required' => $access['upgrade_required']
        ];
    }
    
    // User has access - proceed
    return fetchGPSData($busId);
}

// Protect API access
function handleAPIRequest($userId, $request) {
    global $subscriptionManager;
    
    $access = $subscriptionManager->canAccessFeature($userId, 'api_access');
    
    if (!$access['allowed']) {
        http_response_code(403);
        return ['error' => 'API access requires Enterprise plan'];
    }
    
    // Process API request
    return processRequest($request);
}
```

### 4. Bus Limit Enforcement

```php
// Before adding a new bus
function addBus($userId, $busData) {
    global $subscriptionManager, $pgPool;
    
    // Count current buses
    $stmt = $pgPool->prepare("SELECT COUNT(*) FROM buses WHERE company_id = :user_id");
    $stmt->execute(['user_id' => $userId]);
    $currentCount = $stmt->fetchColumn();
    
    // Check if can add more
    $canAdd = $subscriptionManager->canAddBus($userId, $currentCount);
    
    if (!$canAdd['allowed']) {
        return [
            'error' => $canAdd['reason'],
            'upgrade_to' => $canAdd['upgrade_required'],
            'current_limit' => $canAdd['limit']
        ];
    }
    
    // Add the bus
    // ...
}
```

### 5. Subscription Upgrade

```php
// After M-PESA payment verification
function upgradeSubscription($userId, $newPlan, $mpesaTransactionId) {
    global $subscriptionManager;
    
    // Verify payment (your M-PESA integration)
    $payment = verifyMpesaPayment($mpesaTransactionId);
    
    if (!$payment['success']) {
        return ['error' => 'Payment verification failed'];
    }
    
    // Upgrade subscription
    $result = $subscriptionManager->upgradePlan(
        $userId,
        $newPlan,
        $payment['amount'],
        'M-PESA'
    );
    
    if ($result['success']) {
        // Send confirmation
        sendUpgradeEmail($userId, $result);
        
        return [
            'success' => true,
            'message' => $result['message'],
            'new_plan' => $result['new_plan']
        ];
    }
    
    return ['error' => $result['error']];
}
```

## 📚 API Reference

### SubscriptionManager Class

#### `createTrialForNewUser($userId, $userEmail)`

Creates a subscription for a new user.

**Parameters:**
- `$userId` (string): User ID from users table
- `$userEmail` (string): User's email address

**Returns:** Array with:
```php
[
    'success' => true/false,
    'subscription' => [...],  // Subscription record
    'message' => 'Trial created',
    'error' => null  // If success=false
]
```

**Special Behavior:**
- Regular users: 14-day Starter trial
- `mugisha@gmail.com`: Enterprise ACTIVE 30 days

---

#### `checkAndUpdateSubscription($userId)`

Checks and updates subscription status based on current date.

**Parameters:**
- `$userId` (string): User ID to check

**Returns:** Array with:
```php
[
    'success' => true/false,
    'subscription' => [...],
    'status_changed' => true/false,
    'old_status' => 'TRIAL_ACTIVE',
    'new_status' => 'TRIAL_EXPIRING'
]
```

**Call this:**
- On every user login
- Via daily cron job

---

#### `canAccessFeature($userId, $feature)`

Checks if user can access a specific feature.

**Parameters:**
- `$userId` (string): User ID
- `$feature` (string): Feature name (e.g., 'gps_tracking')

**Returns:** Array with:
```php
[
    'allowed' => true/false,
    'reason' => 'Feature not included in Starter plan',
    'upgrade_required' => 'Growth',  // Plan needed
    'current_plan' => 'Starter'
]
```

**Feature Names:**

**Starter:**
- `basic_ticketing`
- `basic_reporting`
- `email_support`
- `mobile_app_access`

**Growth:**
- All Starter features +
- `gps_tracking`
- `driver_accounts`
- `advanced_analytics`
- `route_optimization`
- `qr_code_scanning`
- `priority_support`
- `custom_branding`

**Enterprise:**
- All Growth features +
- `api_access`
- `webhook_integration`
- `white_label`
- `dedicated_support`
- `sla_guarantee`
- `custom_integrations`
- `data_export`

---

#### `canAddBus($userId, $currentBusCount)`

Checks if user can add another bus.

**Parameters:**
- `$userId` (string): User ID
- `$currentBusCount` (int): Current number of buses

**Returns:** Array with:
```php
[
    'allowed' => true/false,
    'reason' => 'Bus limit reached (5 buses)',
    'limit' => 5,  // NULL for unlimited
    'current' => 5,
    'remaining' => 0,
    'upgrade_required' => 'Growth'
]
```

**Bus Limits:**
- Starter: 5 buses
- Growth: 20 buses
- Enterprise: Unlimited (NULL)

---

#### `upgradePlan($userId, $newPlan, $paymentAmount, $paymentMethod)`

Upgrades user's subscription to a different plan.

**Parameters:**
- `$userId` (string): User ID
- `$newPlan` (string): 'Starter', 'Growth', or 'Enterprise'
- `$paymentAmount` (float): Amount paid
- `$paymentMethod` (string): 'M-PESA', 'Bank', etc.

**Returns:** Array with:
```php
[
    'success' => true/false,
    'message' => 'Subscription upgraded from Starter to Growth',
    'old_plan' => 'Starter',
    'new_plan' => 'Growth',
    'action' => 'UPGRADED'  // or 'DOWNGRADED', 'RENEWED'
]
```

---

#### `getSubscription($userId)`

Gets user's current subscription details.

**Parameters:**
- `$userId` (string): User ID

**Returns:** Array with full subscription record or `null`

---

#### `getAllPlans()`

Gets all available subscription plans.

**Returns:** Array of plan records:
```php
[
    [
        'id' => 1,
        'name' => 'Starter',
        'price' => 50000.00,
        'max_buses' => 5,
        'features' => ['basic_ticketing', ...],
        'trial_days' => 14,
        'grace_period_days' => 7
    ],
    // ... Growth, Enterprise
]
```

---

#### `getSubscriptionHistory($userId, $limit = 50)`

Gets subscription change history for a user.

**Parameters:**
- `$userId` (string): User ID
- `$limit` (int): Maximum records to return

**Returns:** Array of history records

## ⏰ Cron Jobs

### Daily Subscription Update

Updates all subscription statuses and sends notifications.

**File:** `backend/php/daily_subscription_update_postgresql.php`

**Setup:**

```bash
# Make executable
chmod +x backend/php/daily_subscription_update_postgresql.php

# Add to crontab
crontab -e

# Add this line (runs at midnight daily)
0 0 * * * /usr/bin/php /var/www/safatitix/backend/php/daily_subscription_update_postgresql.php >> /var/log/subscription_cron.log 2>&1
```

**What it does:**

1. Fetches all users with subscriptions
2. Calls `checkAndUpdateSubscription()` for each
3. Sends notifications for status changes:
   - Trial expiring (3 days warning)
   - Trial expired
   - Grace period started
   - Subscription expired
4. Logs execution summary to `cron_logs` table
5. Sends admin alert if errors occur

**Output:**

```
=====================================================
SafariTix Daily Subscription Update - PostgreSQL
Started: 2026-02-10 00:00:00
=====================================================

Found 150 users with subscriptions

Processing: user1@example.com (Current: TRIAL_ACTIVE)
  ✓ Status changed: TRIAL_ACTIVE → TRIAL_EXPIRING
  📧 Sent trial expiring notification

Processing: user2@example.com (Current: ACTIVE)
  ⚪ No change

...

=====================================================
Update Summary
=====================================================
Total Users:              150
Statuses Updated:         23
Unchanged:                125
Errors:                   2
-----------------------------------------------------
Trials Expiring Soon:     15
Trials Expired:           5
Entered Grace Period:     2
Fully Expired:            1
-----------------------------------------------------
Execution Time:           3.45s
Completed:                2026-02-10 00:00:03
=====================================================
```

## 🧪 Testing

### Run All Tests

```bash
php backend/php/test_subscription_system_postgresql.php
```

### Test Coverage

The test script validates:

1. ✓ Database tables exist
2. ✓ PostgreSQL custom types exist
3. ✓ All 3 plans inserted correctly
4. ✓ Trial subscription creation
5. ✓ Status update function works
6. ✓ Feature access control
7. ✓ Bus limit enforcement
8. ✓ Special test user (mugisha@gmail.com)
9. ✓ Subscription upgrade
10. ✓ Subscription history logging
11. ✓ PostgreSQL function execution
12. ✓ Array feature parsing
13. ✓ Test data cleanup

### Manual Testing

```bash
# Check tables
psql -d safatitix -c "\dt"

# Check custom types
psql -d safatitix -c "\dT"

# View plans
psql -d safatitix -c "SELECT name, price, max_buses FROM subscription_plans;"

# View subscriptions
psql -d safatitix -c "SELECT user_id, plan_name::TEXT, status::TEXT FROM subscriptions;"

# View history
psql -d safatitix -c "SELECT user_id, action::TEXT, old_plan::TEXT, new_plan::TEXT FROM subscription_history ORDER BY created_at DESC LIMIT 10;"

# Test function
psql -d safatitix -c "SELECT * FROM update_subscription_status('user_id_here');"
```

## 🔧 Troubleshooting

### Issue: "Type does not exist"

**Error:** `type "subscription_plan_name" does not exist`

**Solution:**
```bash
# Make sure migration ran completely
psql -d safatitix -c "\dT"

# If types missing, re-run migration
psql -d safatitix -f backend/migrations/create-subscriptions-table-postgresql.sql
```

### Issue: "Column subscription_status does not exist in users table"

**Error:** `column "subscription_status" does not exist`

**Solution:**
```sql
-- Add column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'TRIAL_ACTIVE';
```

### Issue: PostgreSQL array not parsing

**Error:** Features showing as string `{feature1,feature2}`

**Solution:**
```php
// The SubscriptionManager handles this automatically
// If you need to parse manually:
$featuresString = '{basic_ticketing,gps_tracking}';
$features = str_replace(['{', '}', '"'], '', $featuresString);
$featuresArray = explode(',', $features);
```

### Issue: Foreign key constraint fails

**Error:** `foreign key constraint fails`

**Solution:**
```sql
-- Make sure users table exists first
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Issue: Cron job not running

**Check cron logs:**
```bash
# View cron log
tail -f /var/log/subscription_cron.log

# Check if cron is running
sudo systemctl status cron

# Test script manually
php backend/php/daily_subscription_update_postgresql.php
```

### Issue: Test user not getting Enterprise

**Check:** Make sure email comparison is case-insensitive

```php
// In SubscriptionManager::createTrialForNewUser()
$isTestUser = (strtolower($userEmail) === 'mugisha@gmail.com');
```

## 📝 Common Queries

### Get all expiring trials

```sql
SELECT 
    u.email,
    s.trial_end_date,
    EXTRACT(DAY FROM s.trial_end_date - NOW()) as days_left
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'TRIAL_EXPIRING'::subscription_status
ORDER BY s.trial_end_date;
```

### Get revenue by plan

```sql
SELECT 
    s.plan_name::TEXT,
    COUNT(*) as subscribers,
    SUM(sp.price) as monthly_revenue
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_name = sp.name
WHERE s.status = 'ACTIVE'::subscription_status
GROUP BY s.plan_name::TEXT
ORDER BY monthly_revenue DESC;
```

### Get users in grace period

```sql
SELECT 
    u.email,
    s.end_date,
    s.end_date + INTERVAL '7 days' as grace_period_ends
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'GRACE_PERIOD'::subscription_status;
```

### Audit trail for user

```sql
SELECT 
    action::TEXT,
    old_plan::TEXT,
    new_plan::TEXT,
    old_status::TEXT,
    new_status::TEXT,
    notes,
    created_at
FROM subscription_history
WHERE user_id = 'user_id_here'
ORDER BY created_at DESC;
```

## 📞 Support

For issues or questions:

- **Email:** support@safatitix.com
- **Documentation:** See `QUICK_REFERENCE_POSTGRESQL.md` for code snippets
- **GitHub Issues:** [safatitix/issues](https://github.com/yourusername/safatitix)

## 📄 License

Copyright © 2026 SafariTix. All rights reserved.
