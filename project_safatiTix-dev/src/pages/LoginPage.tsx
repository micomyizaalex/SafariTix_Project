import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuthStore } from '../stores/authStore';
import { TrendingUp, MapPin, Users } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response =  await login(loginEmail, loginPassword);
      console.log(response.homePath)
      navigate(`${response.homePath}`);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-10 bg-white overflow-y-auto">
        <div className="max-w-[480px] w-full mx-auto">
          {/* Back to Home */}
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#0077B6] text-sm mb-5 transition-colors">
            ← Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#0077B6] rounded-xl flex items-center justify-center text-white">
              <Bus size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900 font-montserrat">SafariTix</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-montserrat">Welcome Back</h1>
          <p className="text-gray-500 mb-8">
            Sign in to your account to continue your journey with smart bus ticketing.
          </p>

          {/* Error Message */}
          {error && (
            <Alert className="mb-5 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-800">{error}</p>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors"
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-[#0077B6] focus:outline-none transition-colors pr-12"
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

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 accent-[#0077B6]" />
                <label htmlFor="remember" className="text-sm text-gray-500">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#0077B6] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#005F8E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/app/signup" className="text-[#0077B6] font-medium hover:underline">
              Sign up for free
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
          <h2 className="text-5xl font-bold mb-4 font-montserrat">
            Seamless Travel<br />Starts Here
          </h2>
          <p className="text-lg mb-12 opacity-95">
            Access your personalized dashboard with real-time bus tracking and ticket management.
          </p>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm opacity-90">Active Users</span>
                <Users size={20} />
              </div>
              <div className="text-4xl font-bold mb-2">12,543</div>
              <div className="text-sm flex items-center gap-1">
                <TrendingUp size={16} />
                <span>40% last month</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm opacity-90">Buses Tracked</span>
                <MapPin size={20} />
              </div>
              <div className="text-4xl font-bold mb-2">856</div>
              <div className="text-sm flex items-center gap-1">
                <TrendingUp size={16} />
                <span>18% last month</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-10 space-y-4">
            {['Personalized dashboard', 'Real-time bus tracking', 'Quick ticket booking', 'Secure payment history'].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check size={16} />
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

