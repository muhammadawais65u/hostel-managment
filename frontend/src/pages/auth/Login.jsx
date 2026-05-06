import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || location.state?.redirect;
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const { user } = result;
      // If redirect param exists, go there with state (for book now flow)
      if (redirectTo) {
        navigate(redirectTo, { 
          state: location.state ? {
            selectedRoom: location.state.selectedRoom,
            selectedRoomId: location.state.selectedRoomId
          } : undefined
        });
        return;
      }
      // Otherwise redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'warden') {
        navigate('/warden/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center relative">
        {/* Back to Home Button on Image Side */}
        <div className="absolute top-8 left-8 z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-white bg-blue-600 hover:bg-blue-700 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
        <img 
          src="/login-image.png" 
          alt="Login Illustration" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 px-8 py-12">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-white mb-2">Welcome!</h1>
            <p className="text-blue-100 text-lg">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6">
              <div className="bg-red-500/20 border border-red-400/30 text-white px-4 py-3 rounded-full">
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="Your e-mail"
                className="w-full pl-14 pr-6 py-4 bg-white rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full pl-14 pr-14 py-4 bg-white rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border-2 border-white/60 rounded peer-checked:bg-white peer-checked:border-white transition-all mr-2"></div>
                <span className="text-white/80">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-white/80 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="flex gap-4 pt-2">
              <Link
                to="/register"
                className="flex-1 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full hover:from-orange-500 hover:to-orange-600 transition-all duration-200 text-center shadow-lg"
              >
                Create account
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
