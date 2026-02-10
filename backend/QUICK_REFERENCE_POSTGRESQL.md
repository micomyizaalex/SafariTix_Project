# SafariTix Subscription System - PostgreSQL Quick Reference

Quick code snippets for common subscription operations.

## 🚀 Initialization

```php
require_once 'backend/php/SubscriptionManagerPostgreSQL.php';
require_once 'backend/config/pgPool.php';

$subscriptionManager = new SubscriptionManager($pgPool);
```

## 📋 Common Operations

### 1. Create Trial on Signup

```php
// Regular user signup
$userId = uniqid('user_', true);
$email = 'newuser@example.com';

$result = $subscriptionManager->createTrialForNewUser($userId, $email);

if ($result['success']) {
    // 14-day Starter trial created
    $subscription = $result['subscription'];
    echo "Trial ends: " . $subscription['trial_end_date'];
} else {
    echo "Error: " . $result['error'];
}
```

### 2. Check Status on Login

```php
// On every login
$check = $subscriptionManager->checkAndUpdateSubscription($userId);

if ($check['status_changed']) {
    $newStatus = $check['new_status'];
    
    switch ($newStatus) {
        case 'TRIAL_EXPIRING':
            showAlert("Trial expires in 3 days!");
            break;
        case 'TRIAL_EXPIRED':
            redirect('/upgrade');
            break;
        case 'GRACE_PERIOD':
            showWarning("Limited access - renew now");
            break;
        case 'EXPIRED':
            redirect('/renew-subscription');
            break;
    }
}
```

### 3. Feature Gating

```php
// Before allowing GPS access
$access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');

if (!$access['allowed']) {
    return [
        'error' => $access['reason'],
        'upgrade_to' => $access['upgrade_required'],
        'current_plan' => $access['current_plan']
    ];
}

// Feature allowed - proceed
return getGPSData($busId);
```

### 4. Check Bus Limit

```php
// Before adding a bus
$currentCount = countUserBuses($userId);
$canAdd = $subscriptionManager->canAddBus($userId, $currentCount);

if (!$canAdd['allowed']) {
    return [
        'error' => "Bus limit reached ({$canAdd['limit']} buses)",
        'upgrade_to' => $canAdd['upgrade_required']
    ];
}

// Can add - proceed
createBus($busData);
```

### 5. Upgrade Subscription

```php
// After payment verification
$result = $subscriptionManager->upgradePlan(
    $userId,
    'Growth',           // New plan
    150000.00,          // Amount paid
    'M-PESA'           // Payment method
);

if ($result['success']) {
    echo "Upgraded from {$result['old_plan']} to {$result['new_plan']}";
    sendConfirmationEmail($userId);
}
```

## 🎯 Feature Names Reference

```php
// Starter features
'basic_ticketing'
'basic_reporting'
'email_support'
'mobile_app_access'

// Growth features (includes all Starter)
'gps_tracking'
'driver_accounts'
'advanced_analytics'
'route_optimization'
'qr_code_scanning'
'priority_support'
'custom_branding'

// Enterprise features (includes all Growth)
'api_access'
'webhook_integration'
'white_label'
'dedicated_support'
'sla_guarantee'
'custom_integrations'
'data_export'
```

## 🔒 Middleware Example

```php
function requireFeature($feature) {
    global $subscriptionManager;
    $userId = $_SESSION['user_id'];
    
    $access = $subscriptionManager->canAccessFeature($userId, $feature);
    
    if (!$access['allowed']) {
        http_response_code(403);
        echo json_encode([
            'error' => 'Feature not available',
            'message' => $access['reason'],
            'upgrade_required' => $access['upgrade_required']
        ]);
        exit;
    }
}

// Usage
requireFeature('gps_tracking');
// Continue only if user has access
```

## 📊 Common Queries

### Get user's subscription

```php
$subscription = $subscriptionManager->getSubscription($userId);

echo "Plan: " . $subscription['plan_name'];
echo "Status: " . $subscription['status'];
echo "Max Buses: " . ($subscription['max_buses'] ?? 'Unlimited');
echo "Features: " . implode(', ', $subscription['features']);
```

### Get all plans

```php
$plans = $subscriptionManager->getAllPlans();

foreach ($plans as $plan) {
    echo "{$plan['name']}: RWF " . number_format($plan['price']);
    echo " ({$plan['max_buses'] ?? 'Unlimited'} buses)";
}
```

### Get subscription history

```php
$history = $subscriptionManager->getSubscriptionHistory($userId, 10);

foreach ($history as $entry) {
    echo "{$entry['action']}: {$entry['old_plan']} → {$entry['new_plan']}";
    echo " on " . $entry['created_at'];
}
```

## 🗄️ Direct SQL Queries

### Check subscription status

```sql
SELECT 
    user_id,
    plan_name::TEXT,
    status::TEXT,
    is_trial,
    end_date
FROM subscriptions
WHERE user_id = 'user_id_here';
```

### Get expiring trials

```sql
SELECT 
    u.email,
    s.trial_end_date,
    EXTRACT(DAY FROM s.trial_end_date - NOW()) as days_left
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'TRIAL_EXPIRING'::subscription_status;
```

### Calculate revenue

```sql
SELECT 
    s.plan_name::TEXT,
    COUNT(*) as subscribers,
    SUM(sp.price) as monthly_revenue
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_name = sp.name
WHERE s.status = 'ACTIVE'::subscription_status
GROUP BY s.plan_name::TEXT;
```

### Update status manually

```sql
SELECT * FROM update_subscription_status('user_id_here');
```

## 🔄 Status Flow

```
NEW USER
   ↓
TRIAL_ACTIVE (14 days)
   ↓
TRIAL_EXPIRING (≤3 days left)
   ↓
TRIAL_EXPIRED (trial ended)
   ↓ (after payment)
ACTIVE (paid subscription)
   ↓ (if expires)
GRACE_PERIOD (7 days limited access)
   ↓
EXPIRED (no access)
```

## 🎫 Test User

```php
// Special test user always gets Enterprise ACTIVE
$result = $subscriptionManager->createTrialForNewUser(
    'test_id',
    'mugisha@gmail.com'  // Case-insensitive
);

// Returns:
// - Plan: Enterprise
// - Status: ACTIVE (not trial)
// - Duration: 30 days
// - Max buses: Unlimited
```

## ⏰ Cron Job

```bash
# Add to crontab
0 0 * * * /usr/bin/php /path/to/daily_subscription_update_postgresql.php

# Or run manually
php backend/php/daily_subscription_update_postgresql.php
```

## 🧪 Testing

```bash
# Run all tests
php backend/php/test_subscription_system_postgresql.php

# Check specific table
psql -d safatitix -c "SELECT * FROM subscription_plans;"

# Check types
psql -d safatitix -c "\dT"

# View subscriptions
psql -d safatitix -c "SELECT user_id, plan_name::TEXT, status::TEXT FROM subscriptions LIMIT 10;"
```

## 🐛 Debugging

### Enable PostgreSQL logging

```php
// In pgPool.php
$pgPool->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Log all queries
$pgPool->setAttribute(PDO::ATTR_STATEMENT_CLASS, [PDOStatement::class]);
```

### Check last query error

```php
try {
    $result = $subscriptionManager->createTrialForNewUser($userId, $email);
} catch (Exception $e) {
    error_log("Subscription error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
}
```

### Verify PostgreSQL connection

```php
try {
    $pgPool->query('SELECT NOW()');
    echo "Database connected";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
```

## 📱 Integration Patterns

### Express-style API

```php
// POST /api/subscription/upgrade
function handleUpgrade() {
    global $subscriptionManager;
    $userId = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    
    $result = $subscriptionManager->upgradePlan(
        $userId,
        $data['plan'],
        $data['amount'],
        $data['payment_method']
    );
    
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
}
```

### Middleware pattern

```php
function checkSubscription($next) {
    global $subscriptionManager;
    $userId = $_SESSION['user_id'];
    
    $check = $subscriptionManager->checkAndUpdateSubscription($userId);
    $status = $check['subscription']['status'];
    
    if ($status === 'EXPIRED' || $status === 'TRIAL_EXPIRED') {
        http_response_code(402);
        echo json_encode(['error' => 'Payment required']);
        exit;
    }
    
    $next();
}
```

### React integration

```typescript
// TypeScript types
interface Subscription {
    plan_name: 'Starter' | 'Growth' | 'Enterprise';
    status: 'TRIAL_ACTIVE' | 'TRIAL_EXPIRING' | 'TRIAL_EXPIRED' | 
            'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED';
    is_trial: boolean;
    trial_end_date: string | null;
    end_date: string | null;
    max_buses: number | null;
    features: string[];
}

// Fetch subscription
async function getSubscription(): Promise<Subscription> {
    const response = await fetch('/api/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}

// Check feature access
async function canAccess(feature: string): Promise<boolean> {
    const subscription = await getSubscription();
    return subscription.features.includes(feature);
}
```

## 🔑 Key Constants

```php
// Plan names
const PLAN_STARTER = 'Starter';
const PLAN_GROWTH = 'Growth';
const PLAN_ENTERPRISE = 'Enterprise';

// Statuses
const STATUS_TRIAL_ACTIVE = 'TRIAL_ACTIVE';
const STATUS_TRIAL_EXPIRING = 'TRIAL_EXPIRING';
const STATUS_TRIAL_EXPIRED = 'TRIAL_EXPIRED';
const STATUS_ACTIVE = 'ACTIVE';
const STATUS_GRACE_PERIOD = 'GRACE_PERIOD';
const STATUS_EXPIRED = 'EXPIRED';

// Trial duration
const TRIAL_DAYS = 14;
const GRACE_PERIOD_DAYS = 7;

// Bus limits
const STARTER_BUS_LIMIT = 5;
const GROWTH_BUS_LIMIT = 20;
const ENTERPRISE_BUS_LIMIT = null; // Unlimited
```

## 📞 Quick Help

**Issue:** Type not found  
**Fix:** `psql -d safatitix -f backend/migrations/create-subscriptions-table-postgresql.sql`

**Issue:** Feature array is string  
**Fix:** Already handled by SubscriptionManager (converts PostgreSQL array)

**Issue:** Test user not getting Enterprise  
**Fix:** Check email is exactly `mugisha@gmail.com` (case-insensitive)

**Issue:** Status not updating  
**Fix:** Run `SELECT * FROM update_subscription_status('user_id');`

**Need more help?** See `SUBSCRIPTION_README_POSTGRESQL.md`
