import React,{ useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bus, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  // Local login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Local signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState('commuter');
  const [companyName, setCompanyName] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock login (replace with your own backend later)
    setTimeout(() => {
      if (loginEmail && loginPassword) {
        setSuccessMessage('Login successful!');
      } else {
        setError('Please enter valid credentials');
      }
      setIsLoading(false);
    }, 800);
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          company_name: signupRole === 'company_admin' ? companyName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccessMessage('Account created successfully!');
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setSignupRole('commuter');
      setCompanyName('');
      
      // If backend returned an auth token, persist and redirect directly to dashboard
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const role = data.user?.role;
        const rolePath: Record<string, string> = {
          admin: '/dashboard/admin',
          company_admin: '/dashboard/company',
          commuter: '/dashboard/commuter',
          driver: '/dashboard/driver'
        };
        window.location.href = rolePath[role] || '/';
        return;
      }

      // Fallback: redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          

          <div className="flex justify-center mb-4">
            <div className="bg-[#006AFF] text-white p-3 rounded-full">
              <Bus className="w-8 h-8" />
            </div>
          </div>

          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>SafariTix</CardTitle>
          <CardDescription>Modern Bus Ticketing Platform</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 border-success">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name: </Label>
                  <Input value={signupName} onChange={e => setSignupName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Email: </Label>
                  <Input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Password: </Label>
                  <Input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>I am a: </Label>
                  <Select value={signupRole} onValueChange={setSignupRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commuter">Commuter (Passenger)</SelectItem>
                      <SelectItem value="company_admin">Transport Company</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {signupRole === 'company_admin' && (
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                  </div>
                )}

                <Button type="submit" className="w-full bg-[#006AFF] hover:bg-[#0056cc]" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            
        </CardContent>
      </Card>
    </div>
  );
}