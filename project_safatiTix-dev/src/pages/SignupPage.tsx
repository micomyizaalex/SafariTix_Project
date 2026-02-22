// pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bus, AlertCircle, Eye, EyeOff, TrendingUp, MapPin, Users, Check, LogIn, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuthStore } from '../stores/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState('commuter');
  const [companyName, setCompanyName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!agreeToTerms) {
      setError('Please agree to the Terms & Privacy');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        full_name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        company_name: signupRole === 'company_admin' ? companyName : undefined,
      };

      await register(userData);
      
      setSuccessMessage('Account created successfully!');
      
      // Navigate based on role
      const rolePath: Record<string, string> = {
        admin: '/dashboard/admin',
        company_admin: '/dashboard/company',
        commuter: '/dashboard/commuter',
        driver: '/dashboard/driver'
      };
      
      setTimeout(() => {
        navigate(rolePath[signupRole] || '/dashboard/commuter');
      }, 1200);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-10 bg-white overflow-y-auto">
        <div className="max-w-[480px] w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#0077B6] rounded-xl flex items-center justify-center text-white">
              <Bus className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-[#2B2D42] font-montserrat">SafariTix</span>
          </Link>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#2B2D42] font-montserrat mb-2">Get Started Now</h1>
          <p className="text-gray-500 mb-8">
            Discover the power of smart bus ticketing to enhance your travel experience.
          </p>

          {/* Social Login Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 py-3 px-5 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert className="mb-5 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-5 border-green-200 bg-green-50">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors bg-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="william@company.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors bg-white"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors bg-white pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <Select value={signupRole} onValueChange={setSignupRole}>
                <SelectTrigger className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commuter">Commuter (Passenger)</SelectItem>
                  <SelectItem value="company_admin">Transport Company</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Name (conditional) */}
            {signupRole === 'company_admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors bg-white"
                  required
                />
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 accent-[#0077B6]"
              />
              <label htmlFor="terms" className="text-sm text-gray-500">
                I agree to the{' '}
                <Link to="/terms" className="text-[#0077B6] font-medium hover:underline">
                  Terms & Privacy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#005F8E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/app/login" className="text-[#0077B6] font-medium hover:underline inline-flex items-center gap-1">
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0077B6] to-[#005F8E] p-16 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -top-[100px] -right-[100px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 -bottom-[50px] -left-[50px]" />

        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 font-montserrat leading-tight">
            Simplify Your Journey
            <br />
            and Boost Travel Efficiency
          </h2>
          <p className="text-lg mb-12 opacity-95">
            Elevate Your Travel with Smart Bus Ticketing Platform.
          </p>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm opacity-90">Active Users</span>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-4xl font-bold mb-2">12,543</div>
              <div className="text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>40% last month</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm opacity-90">Monthly Bookings</span>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-4xl font-bold mb-2">8,234</div>
              <div className="text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>25% last month</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {['Instant ticket booking', 'Real-time bus tracking', 'Secure payments', 'Monthly subscriptions'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Trusted By */}
          <div className="mt-16 pt-10 border-t border-white/20">
            <p className="text-sm opacity-80 mb-5">Trusted by leading transport companies</p>
            <div className="flex gap-8 flex-wrap">
              {['Volcano', 'Ritco', 'Virunga', 'Onatracom'].map((company, idx) => (
                <span key={idx} className="text-xl font-semibold opacity-70">{company}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}