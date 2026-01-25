import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bus, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Link } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
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
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSuccessMessage('Login successful!');

      // Persist token/user for subsequent requests and perform a full redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const redirect = data?.homePath || data?.user?.homePath;
      // Do a full page navigation so AuthProvider re-initializes from localStorage
      window.location.href = redirect || '/';

    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Mock signup
    setTimeout(() => {
      setSuccessMessage('Account created successfully! Please login.');
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setSignupRole('commuter');
      setCompanyName('');
      setActiveTab('login');
      setIsLoading(false);
    }, 800);
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

          
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder='Enter your email...' value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className='border border-gray-500' />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder='Enter your password...' value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className='border border-gray-500' />
                </div>

                <Button type="submit" className="w-full bg-[#006AFF] hover:bg-[#0056cc]" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <p>Don't have an account? <Link to="/signup" className="text-primary">Sign up</Link></p>
              </form>
            
        </CardContent>
      </Card>
    </div>
  );
}