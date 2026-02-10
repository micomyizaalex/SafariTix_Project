# SafariTix Subscription System - Quick Reference

## 🚀 Quick Start

```php
require_once 'SubscriptionManager.php';
require_once 'database.php';

$subscriptionManager = new SubscriptionManager($db);
```

## 📖 Common Operations

### 1. New User Signup (Automatic Trial)

```php
// Creates 14-day trial on Starter plan
// Special: mugisha@gmail.com gets Enterprise ACTIVE for 30 days
$result = $subscriptionManager->createTrialForNewUser($userId, $userEmail);

// Returns:
[
    'success' => true,
    'subscription' => [...],
    'message' => '14-day trial subscription created on Starter plan'
]
```

### 2. User Login Check

```php
// Automatically updates subscription status based on dates
$result = $subscriptionManager->checkAndUpdateSubscription($userId);

// Returns:
[
    'success' => true,
    'subscription' => [...],
    'status_changed' => true/false,
    'old_status' => 'TRIAL_ACTIVE',
    'new_status' => 'TRIAL_EXPIRING'
]
```

### 3. Check Feature Access

```php
// Check if user can access a specific feature
$access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');

// Returns:
[
    'allowed' => true/false,
    'plan' => 'Growth',
    'status' => 'ACTIVE',
    'reason' => 'Access granted' or 'Feature not available in your plan'
]
```

### 4. Check Bus Limit

```php
// Check if user can add more buses
$currentBusCount = 3; // Get from your database
$check = $subscriptionManager->canAddBus($userId, $currentBusCount);

// Returns:
[
    'allowed' => true/false,
    'reason' => 'You can add more buses (limit: 5)',
    'current' => 3,
    'limit' => 5,
    'plan' => 'Starter'
]
```

### 5. Upgrade/Downgrade Plan

```php
// Upgrade subscription (after payment processing)
$result = $subscriptionManager->upgradePlan(
    $userId,
    'Growth',          // New plan name
    150000.00,         // Payment amount
    'M-PESA'          // Payment method
);

// Returns:
[
    'success' => true,
    'message' => 'Successfully UPGRADED to Growth plan',
    'new_plan' => 'Growth',
    'end_date' => '2026-03-12 10:30:00'
]
```

### 6. Get Subscription Details

```php
// Get full subscription info
$subscription = $subscriptionManager->getSubscription($userId);

// Returns full subscription object with plan details
```

### 7. Get All Plans

```php
// Get available subscription plans
$plans = $subscriptionManager->getAllPlans();

// Returns array of all plans with pricing and features
```

## 🎯 Feature Names for Access Control

### Starter Features
```php
'basic_ticketing'
'seat_management'
'create_schedules'
'company_profile'
'manual_driver_assignment'
'daily_revenue_summary'
```

### Growth Features (includes all Starter features)
```php
'gps_tracking'
'ticket_cancellation'
'advanced_analytics'
'driver_accounts'
'route_performance'
'priority_support'
```

### Enterprise Features (includes all Growth features)
```php
'unlimited_buses'
'multiple_admins'
'custom_reports'
'api_access'
'dedicated_support'
'sla_guarantee'
'custom_integrations'
```

## 🔐 Feature Gating Patterns

### Pattern 1: Block Access

```php
function protectedFeature($userId) {
    global $subscriptionManager;
    
    $access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');
    
    if (!$access['allowed']) {
        return [
            'success' => false,
            'error' => 'Feature not available',
            'upgrade_required' => true,
            'current_plan' => $access['plan']
        ];
    }
    
    // Continue with feature logic
}
```

### Pattern 2: Middleware

```php
function requireFeature($feature) {
    return function($userId) use ($feature) {
        global $subscriptionManager;
        
        $access = $subscriptionManager->canAccessFeature($userId, $feature);
        
        if (!$access['allowed']) {
            http_response_code(403);
            echo json_encode(['error' => 'Upgrade required']);
            exit;
        }
    };
}

// Usage
requireFeature('gps_tracking')($userId);
```

###Pattern 3: Graceful Degradation

```php
function getAnalytics($userId) {
    global $subscriptionManager;
    
    $access = $subscriptionManager->canAccessFeature($userId, 'advanced_analytics');
    
    if ($access['allowed']) {
        return getAdvancedAnalytics();
    } else {
        return getBasicAnalytics(); // Fallback
    }
}
```

## 📊 Status Checks

### Check Specific Status

```php
$subscription = $subscriptionManager->getSubscription($userId);

if ($subscription['status'] === 'TRIAL_EXPIRING') {
    // Show upgrade prompt
}

if ($subscription['status'] === 'TRIAL_EXPIRED') {
    // Block non-essential features
}

if (in_array($subscription['status'], ['ACTIVE', 'TRIAL_ACTIVE'])) {
    // Full access
}
```

### Calculate Days Remaining

```php
$subscription = $subscriptionManager->getSubscription($userId);
$endDate = new DateTime($subscription['end_date']);
$now = new DateTime();
$interval = $now->diff($endDate);
$daysLeft = $interval->invert ? 0 : $interval->days;

echo "Days remaining: {$daysLeft}";
```

## 🎨 UI/UX Patterns

### Show Subscription Badge

```php
$subscription = $subscriptionManager->getSubscription($userId);
$plan = $subscription['plan_name'];
$status = $subscription['status'];

// Display in UI
echo "<span class='badge badge-{$plan}'>{$plan}</span>";

if ($subscription['is_trial']) {
    $daysLeft = calculateDaysLeft($subscription['end_date']);
    echo "<span class='trial-indicator'>Trial: {$daysLeft} days left</span>";
}
```

### Show Upgrade Prompt

```php
$access = $subscriptionManager->canAccessFeature($userId, 'gps_tracking');

if (!$access['allowed']) {
    echo "
    <div class='upgrade-prompt'>
        <h3>Upgrade to access GPS Tracking</h3>
        <p>This feature is available in Growth and Enterprise plans.</p>
        <button onclick='upgradeNow()'>Upgrade Now</button>
    </div>
    ";
}
```

### Show Bus Limit Warning

```php
$currentBusCount = getCurrentBusCount($userId);
$check = $subscriptionManager->canAddBus($userId, $currentBusCount);

if (!$check['allowed']) {
    echo "
    <div class='alert alert-warning'>
        You've reached your bus limit ({$check['limit']} buses).
        <a href='/upgrade'>Upgrade your plan</a> to add more buses.
    </div>
    ";
}
```

## 🔔 Notification Triggers

### Status-Based Notifications

```php
$check = $subscriptionManager->checkAndUpdateSubscription($userId);

if ($check['status_changed']) {
    switch ($check['new_status']) {
        case 'TRIAL_EXPIRING':
            sendNotification($userId, 'Your trial expires in 3 days!', 'warning');
            break;
            
        case 'TRIAL_EXPIRED':
            sendNotification($userId, 'Trial expired. Upgrade to continue.', 'error');
            break;
            
        case 'GRACE_PERIOD':
            sendNotification($userId, 'Subscription expired. Renew within 7 days.', 'urgent');
            break;
            
        case 'EXPIRED':
            sendNotification($userId, 'Account suspended. Please renew.', 'critical');
            break;
    }
}
```

## 📝 Database Queries

### Get Expiring Trials

```sql
SELECT u.id, u.email, s.end_date,
       DATEDIFF(s.end_date, NOW()) as days_left
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'TRIAL_EXPIRING'
ORDER BY s.end_date ASC;
```

### Revenue Report

```sql
SELECT 
    s.plan_name,
    COUNT(*) as active_subscriptions,
    sp.price,
    COUNT(*) * sp.price as monthly_revenue
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_name = sp.name
WHERE s.status = 'ACTIVE' AND s.is_trial = 0
GROUP BY s.plan_name, sp.price;
```

### Churn Analysis

```sql
SELECT 
    DATE(created_at) as date,
    action,
    COUNT(*) as count
FROM subscription_history
WHERE action IN ('EXPIRED', 'CANCELLED')
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), action
ORDER BY date DESC;
```

## ⚠️ Common Pitfalls

### ❌ Don't Do This

```php
// Don't check status only on login
// Status can change while user is logged in
if ($user->subscription_status === 'ACTIVE') {
    // Status might be outdated!
}
```

### ✅ Do This Instead

```php
// Always check subscription dynamically
$subscription = $subscriptionManager->getSubscription($userId);
if (in_array($subscription['status'], ['ACTIVE', 'TRIAL_ACTIVE'])) {
    // Current status from database
}
```

### ❌ Don't Do This

```php
// Don't hard-code feature limits
if ($busCount >= 5) {
    return 'limit reached';
}
```

### ✅ Do This Instead

```php
// Use subscription manager for dynamic limits
$check = $subscriptionManager->canAddBus($userId, $busCount);
if (!$check['allowed']) {
    return $check['reason'];
}
```

## 🔍 Debugging

### Check Subscription State

```php
$subscription = $subscriptionManager->getSubscription($userId);
var_dump($subscription);
```

### View Subscription History

```sql
SELECT * FROM subscription_history 
WHERE user_id = 'user-id-here' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Force Status Update

```php
$subscriptionManager->checkAndUpdateSubscription($userId);
```

## 📞 Constants Reference

```php
// Status constants
SubscriptionManager::STATUS_TRIAL_ACTIVE
SubscriptionManager::STATUS_TRIAL_EXPIRING
SubscriptionManager::STATUS_TRIAL_EXPIRED
SubscriptionManager::STATUS_ACTIVE
SubscriptionManager::STATUS_GRACE_PERIOD
SubscriptionManager::STATUS_EXPIRED

// Plan constants
SubscriptionManager::PLAN_STARTER
SubscriptionManager::PLAN_GROWTH
SubscriptionManager::PLAN_ENTERPRISE
```

## 🎯 Testing Checklist

- [ ] New user gets trial automatically
- [ ] mugisha@gmail.com gets Enterprise access
- [ ] Trial expires after 14 days
- [ ] Status updates on login
- [ ] Feature gating works correctly
- [ ] Bus limits enforced
- [ ] Upgrade process works
- [ ] Grace period allows limited access
- [ ] Expired subscription blocks access
- [ ] Subscription history logging works

## 📚 Full Documentation

See `SUBSCRIPTION_README.md` for complete documentation.
