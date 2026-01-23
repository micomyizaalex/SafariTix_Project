import { useState } from 'react';
import { useAuth } from './AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Bus, Bell, User, Shield, ArrowLeft, Loader2, Check, Globe, Trash2, Lock, Camera } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, signOut } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  // Language state
  const [language, setLanguage] = useState('en');
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaved(false);

    // Simulate API call to save profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Saving profile to database:', profile);
    
    setIsSavingProfile(false);
    setProfileSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleNotificationToggle = async (key: 'email' | 'push' | 'sms', value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    setIsSavingNotifications(true);
    setNotificationsSaved(false);

    // Simulate API call to update notifications
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Updating notification settings in database:', { [key]: value });
    
    setIsSavingNotifications(false);
    setNotificationsSaved(true);
    
    // Reset saved indicator after 2 seconds
    setTimeout(() => setNotificationsSaved(false), 2000);
  };

  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    setIsSavingLanguage(true);
    setLanguageSaved(false);

    // Simulate API call to update language preference
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Updating language preference in database:', value);
    
    setIsSavingLanguage(false);
    setLanguageSaved(true);
    
    // Reset saved indicator after 2 seconds
    setTimeout(() => setLanguageSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    // Simulate API call to change password
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Updating password in database');
    
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully!');
  };

  const handleDeleteAccount = async () => {
    // Simulate API call to delete account
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Deleting account from database:', user?.id);
    
    alert('Account deleted successfully. You will be logged out.');
    setShowDeleteDialog(false);
    
    // Log out user after deletion
    setTimeout(() => signOut(), 1000);
  };

  const getLanguageLabel = (code: string) => {
    switch(code) {
      case 'en': return 'English';
      case 'rw': return 'Kinyarwanda';
      case 'fr': return 'Français';
      default: return 'English';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Bus className="w-6 h-6 text-[#0077B6]" />
              <h1 style={{ fontFamily: 'Montserrat, sans-serif' }}>Settings</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Theme Settings Note */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme Toggle</p>
                  <p className="text-sm text-muted-foreground">
                    Use the theme toggle button (🌙/☀️) at the top of any page to switch between dark and light mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
                {isSavingProfile && (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {profileSaved && (
                  <Badge className="bg-[#27AE60] gap-1">
                    <Check className="w-3 h-3" />
                    Synced ✅
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#0077B6] text-white flex items-center justify-center text-2xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <Button size="sm" variant="secondary" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user?.role?.replace('_', ' ').toUpperCase() || 'N/A'} disabled />
              </div>
              <Button onClick={handleSaveProfile} className="bg-[#0077B6] hover:bg-[#005a8c]" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Language Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred language
                  </CardDescription>
                </div>
                {isSavingLanguage && (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {languageSaved && (
                  <Badge className="bg-[#27AE60] gap-1">
                    <Check className="w-3 h-3" />
                    Synced ✅
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Display Language</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="rw">🇷🇼 Kinyarwanda</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Current: {getLanguageLabel(language)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive updates
                  </CardDescription>
                </div>
                {isSavingNotifications && (
                  <Badge variant="outline" className="gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {notificationsSaved && (
                  <Badge className="bg-[#27AE60] gap-1">
                    <Check className="w-3 h-3" />
                    Synced ✅
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive booking confirmations and updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get real-time updates on your device
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationToggle('push', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationToggle('sms', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Danger Zone</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-[#E63946] border-[#E63946] hover:bg-[#E63946]/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
              
              <Separator />
              
              <Button variant="destructive" onClick={signOut} className="w-full">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-[#E63946]">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordError('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              className="bg-[#0077B6] hover:bg-[#005a8c]"
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>All your bookings and tickets</li>
                <li>Your preferences and settings</li>
                {user?.role === 'company_admin' && <li>Your company's buses and schedules</li>}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-[#E63946] hover:bg-[#c72f3a]"
            >
              Yes, Delete My Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
