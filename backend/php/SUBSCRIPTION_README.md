# SafariTix Subscription System

Complete PHP backend subscription management system for SafariTix bus ticketing platform.

## 📋 Overview

This subscription system provides:

- **3 Subscription Tiers**: Starter, Growth, Enterprise
- **14-day Free Trial** for all new users
- **Automatic Status Management** based on dates
- **Feature Gating** by plan and status
- **Grace Period** (7 days) after subscription expiry
- **Audit Trail** of all subscription changes
- **Special Test User** (mugisha@gmail.com) gets Enterprise access

## 🗂️ Files Included

```
backend/
├── migrations/
│   └── create-subscriptions-table.sql    # Database schema
├── php/
│   ├── SubscriptionManager.php           # Main subscription class
│   └── subscription_examples.php         # Integration examples
```

## 📊 Subscription Plans

### Starter Plan - RWF 50,000/month
- **Target**: Small operators (1-5 buses, local routes)
- **Max Buses**: 5
- **Features**:
  - Company profile
  - Create schedules
  - Seat management
  - Basic ticket sales
  - Manual driver assignment
  - Daily revenue summary

### Growth Plan - RWF 150,000/month
- **Target**: Medium operators (6-20 buses, inter-city routes)
- **Max Buses**: 20
- **Features**:
  - Everything in Starter, plus:
  - Real-time GPS tracking
  - Ticket cancellation rules
  - Advanced revenue analytics
  - Driver accounts
  - Route performance statistics
  - Priority support

### Enterprise Plan - RWF 250,000/month
- **Target**: Large operators (20+ buses, multi-city/national)
- **Max Buses**: Unlimited
- **Features**:
  - Everything in Growth, plus:
  - Multiple admin accounts
  - Custom reports
  - API access
  - Dedicated support
  - SLA uptime guarantee
  - Custom integrations

## 🚦 Subscription Statuses

| Status | Description | Access Level |
|--------|-------------|--------------|
| `TRIAL_ACTIVE` | Trial period active (>3 days left) | Full access to plan features |
| `TRIAL_EXPIRING` | Trial ending soon (≤3 days left) | Full access + upgrade prompt |
| `TRIAL_EXPIRED` | Trial ended, needs payment | Limited/blocked access |
| `ACTIVE` | Paid subscription active | Full access |
| `GRACE_PERIOD` | Subscription expired, 7-day grace | Limited access + renewal prompt |
| `EXPIRED` | Grace period ended | Blocked access |

## 🔧 Installation

### Step 1: Database Setup

Run the SQL migration to create all necessary tables:

```bash
mysql -u your_username -p your_database < backend/migrations/create-subscriptions-table.sql
```

This creates:
- `subscription_plans` - Plan definitions
- `subscriptions` - User subscriptions
- `subscription_history` - Audit trail
- Stored procedures and triggers

### Step 2: Update Users Table

The migration automatically adds subscription columns to the `users` table:
- `subscription_status`
- `subscription_plan`

### Step 3: Configure Database Connection

Create or update your `database.php` file:

```php
<?php
try {
    $db = new PDO(
        "mysql:host=localhost;dbname=safaritix;charset=utf8mb4",
        "your_username",
        "your_password",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
```

### Step 4: Include Subscription Manager

```php
require_once 'backend/php/SubscriptionManager.php';
require_once 'database.php';

$subscriptionManager = new SubscriptionManager($db);
```

## 💻 Integration Examples

### 1. User Signup (Automatic Trial)

```php
// During user registration
$userId = createUserAccount($email, $password, $name, $companyName);

$subscriptionManager = new SubscriptionManager($db);
$result = $subscriptionManager->createTrialForNewUser($userId, $email);

if ($result['success']) {
    // Trial created successfully
    // For mugisha@gmail.com: Gets Enterprise ACTIVE for 30 days
    // For others: Gets Starter TRIAL_ACTIVE for 14 days
    echo $result['message'];
}
```

### 2. User Login (Check Subscription)

```php
// On every login
$user = authenticateUser($email, $password);

$subscriptionManager = new SubscriptionManager($db);
$check = $subscriptionManager->checkAndUpdateSubscription($user['id']);

if ($check['success']) {
    $subscription = $check['subscription'];
    
    // Check if status changed
    if ($check['status_changed']) {
        // Notify user of status change
        notifyUser($user['id'], $check['old_status'], $check['new_status']);
    }
    
    // Include subscription info in login response
    return [
        'token' => $authToken,
        'user' => $user,
        'subscription' => [
            'plan' => $subscription['plan_name'],
            'status' => $subscription['status'],
            'end_date' => $subscription['end_date']
        ]
    ];
}
```

### 3. Feature Gating

```php
// Protect features based on plan
function getGPSTracking($userId, $busId) {
    global $subscriptionManager;
    
    // Check if user can access GPS tracking
    $access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');
    
    if (!$access['allowed']) {
        return [
            'success' => false,
            'error' => 'GPS tracking not available in your plan',
            'reason' => $access['reason'],
            'upgrade_required' => true
        ];
    }
    
    // User has access - return GPS data
    return getGPSData($busId);
}
```

### 4. Bus Limit Enforcement

```php
// Before adding a new bus
function addBus($userId, $busData) {
    global $db, $subscriptionManager;
    
    // Get current bus count
    $currentBusCount = getCurrentBusCount($userId);
    
    // Check if user can add more buses
    $check = $subscriptionManager->canAddBus($userId, $currentBusCount);
    
    if (!$check['allowed']) {
        return [
            'success' => false,
            'error' => $check['reason'],
            'current' => $check['current'],
            'limit' => $check['limit'],
            'plan' => $check['plan']
        ];
    }
    
    // User can add bus
    return createBus($userId, $busData);
}
```

### 5. Subscription Upgrade

```php
// When user purchases/upgrades subscription
function upgradeToGrowth($userId, $paymentData) {
    global $subscriptionManager;
    
    // Process payment first
    $payment = processPayment($paymentData);
    
    if (!$payment['success']) {
        return ['success' => false, 'error' => 'Payment failed'];
    }
    
    // Upgrade subscription
    $result = $subscriptionManager->upgradePlan(
        $userId,
        SubscriptionManager::PLAN_GROWTH,
        150000.00,
        'M-PESA'
    );
    
    return $result;
}
```

## 🔄 Daily Subscription Status Update

Set up a cron job to run daily:

```bash
# Add to crontab
0 0 * * * php /path/to/safaritix/backend/php/daily_subscription_update.php
```

Create `daily_subscription_update.php`:

```php
<?php
require_once 'SubscriptionManager.php';
require_once 'database.php';

// Get all users
$sql = "SELECT DISTINCT user_id FROM subscriptions";
$stmt = $db->query($sql);
$userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

$subscriptionManager = new SubscriptionManager($db);

foreach ($userIds as $userId) {
    $subscriptionManager->checkAndUpdateSubscription($userId);
}

echo "Daily subscription update complete\n";
?>
```

## 🎯 Feature Matrix

Use these feature constants when checking access:

```php
// Basic Features (Starter)
'basic_ticketing'
'seat_management'
'create_schedules'
'company_profile'
'manual_driver_assignment'
'daily_revenue_summary'

// Growth Features
'gps_tracking'
'ticket_cancellation'
'advanced_analytics'
'driver_accounts'
'route_performance'
'priority_support'

// Enterprise Features
'unlimited_buses'
'multiple_admins'
'custom_reports'
'api_access'
'dedicated_support'
'sla_guarantee'
'custom_integrations'
```

## 🧪 Test User

**Email**: `mugisha@gmail.com`

When this user signs up:
- Automatically gets **Enterprise plan**
- Status: **ACTIVE** (not trial)
- Duration: **30 days**
- Full access to all features

## 📝 API Endpoints

### Authentication

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "company_name": "ABC Transport"
}

Response:
{
  "success": true,
  "user_id": "uuid",
  "subscription": {
    "plan": "Starter",
    "status": "TRIAL_ACTIVE",
    "end_date": "2026-02-24 10:30:00"
  },
  "message": "14-day trial subscription created on Starter plan"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... },
  "subscription": {
    "plan": "Starter",
    "status": "TRIAL_ACTIVE",
    "days_remaining": 12
  }
}
```

### Subscription Management

```http
GET /api/subscription
Authorization: Bearer {token}

Response:
{
  "success": true,
  "subscription": {
    "plan_name": "Starter",
    "status": "TRIAL_ACTIVE",
    "is_trial": true,
    "end_date": "2026-02-24 10:30:00",
    "max_buses": 5,
    "features": [...]
  }
}
```

```http
POST /api/subscription/upgrade
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan": "Growth",
  "payment": {
    "amount": 150000,
    "method": "M-PESA",
    "phone": "250788123456"
  }
}

Response:
{
  "success": true,
  "message": "Successfully UPGRADED to Growth plan",
  "new_plan": "Growth",
  "end_date": "2026-03-10 10:30:00"
}
```

```http
GET /api/subscription/plans

Response:
{
  "success": true,
  "plans": [
    {
      "name": "Starter",
      "price": 50000,
      "max_buses": 5,
      "features": [...]
    },
    {
      "name": "Growth",
      "price": 150000,
      "max_buses": 20,
      "features": [...]
    },
    {
      "name": "Enterprise",
      "price": 250000,
      "max_buses": null,
      "features": [...]
    }
  ]
}
```

## 🔐 Middleware Example

Protect routes with subscription checks:

```php
function requireFeature($feature) {
    return function($userId) use ($feature) {
        global $subscriptionManager;
        
        $access = $subscriptionManager->canAccessFeature($userId, $feature);
        
        if (!$access['allowed']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Feature not available',
                'reason' => $access['reason'],
                'upgrade_required' => true
            ]);
            exit;
        }
    };
}

// Usage
$app->get('/api/gps/tracking', function($req, $res) {
    requireFeature('gps_tracking')($req->user['id']);
    
    // Feature code here
});
```

## 📊 Database Queries

### Check Subscription Status
```sql
SELECT s.*, sp.max_buses, sp.features, sp.price
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_name = sp.name
WHERE s.user_id = 'user-id-here';
```

### Get All Expiring Trials
```sql
SELECT u.id, u.email, u.name, s.end_date
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'TRIAL_EXPIRING'
ORDER BY s.end_date ASC;
```

### Subscription History
```sql
SELECT *
FROM subscription_history
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 10;
```

## 🚨 Error Handling

The system returns consistent error responses:

```php
[
    'success' => false,
    'error' => 'Error message',
    'reason' => 'Detailed reason',
    'upgrade_required' => true/false
]
```

## 📈 Monitoring Queries

### Daily Stats
```sql
SELECT 
    COUNT(*) as total_subscriptions,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN status LIKE 'TRIAL%' THEN 1 ELSE 0 END) as trials,
    SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired
FROM subscriptions;
```

### Revenue Projection
```sql
SELECT 
    plan_name,
    COUNT(*) as subscribers,
    sp.price,
    COUNT(*) * sp.price as monthly_revenue
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_name = sp.name
WHERE s.status IN ('ACTIVE', 'GRACE_PERIOD')
GROUP BY plan_name, sp.price;
```

## 🤝 Support

For questions or issues:
1. Check the example files in `backend/php/subscription_examples.php`
2. Review database schema in `backend/migrations/create-subscriptions-table.sql`
3. Test with mugisha@gmail.com for Enterprise features

## 📄 License

Copyright © 2026 SafariTix. All rights reserved.
