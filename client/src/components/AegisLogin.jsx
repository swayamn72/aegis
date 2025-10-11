import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';
import { toast } from 'react-toastify';
import axios from 'axios';
import AegisOrgPendingApproval from './AegisOrgPendingApproval';
import AegisOrgRejected from './AegisOrgRejected';

const AegisLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [orgStatus, setOrgStatus] = useState(null); // 'pending', 'rejected', or null
  const [orgData, setOrgData] = useState(null);
  const [orgReason, setOrgReason] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const AegisLoginMascot = () => (
    <div className="relative">
      <div className="w-16 h-20 bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-600 rounded-t-full rounded-b-lg border-2 border-blue-300 relative overflow-hidden shadow-lg shadow-blue-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-cyan-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-blue-300/20 to-purple-400/20 rounded-t-full rounded-b-lg border border-cyan-400/30" />
        
        <div className="absolute top-6 left-3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-400/80" />
        <div className="absolute top-6 right-3 w-2 h-2 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-400/80" />
        
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-cyan-200/90 rounded-full shadow-sm shadow-cyan-300/60" />
      </div>
      
      <div className="absolute top-6 -left-2 w-3 h-6 bg-gradient-to-b from-blue-300 to-purple-400 rounded-full transform rotate-45 shadow-md shadow-blue-400/50" />
      <div className="absolute top-8 -right-2 w-3 h-6 bg-gradient-to-b from-blue-300 to-purple-400 rounded-full transform -rotate-12 shadow-md shadow-blue-400/50" />
      
      <div className="absolute -top-1 left-0 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
      <div className="absolute -top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}} />
      <div className="absolute top-0 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}} />
      
      <div className="absolute inset-0 bg-blue-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
      
      <div className="absolute -inset-1 bg-gradient-to-b from-cyan-400/30 via-blue-400/30 to-purple-500/30 rounded-t-full rounded-b-lg blur-sm -z-30 animate-pulse" style={{animationDuration: '2s'}} />
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    setIsLoading(false);

    if (result.success) {
      // Check if it's an organization login
      if (result.userType === 'organization') {
        // For organizations, redirect to organization dashboard or profile
        navigate('/org-dashboard'); 
      } else {
        // Player login - check if profile is complete and redirect accordingly
        const userDataResponse = await fetch('/api/players/me', {
          credentials: 'include',
        });
        if (userDataResponse.ok) {
          const userData = await userDataResponse.json();
          const isProfileComplete = (user) => {
            if (!user) return false;
            return !!(
              user.realName &&
              user.age &&
              user.location &&
              user.country &&
              user.primaryGame &&
              user.teamStatus &&
              user.availability
            );
          };
          if (isProfileComplete(userData)) {
            navigate('/my-profile');
          } else {
            navigate('/complete-profile');
          }
        } else {
          navigate('/complete-profile');
        }
      }
    } else {
      // Check if it's an organization with pending/rejected status
      if (result.userType === 'organization' && result.status) {
        setOrgStatus(result.status);
        setOrgData(result.organization || {});
        setOrgReason(result.reason || '');
        setErrors({});
      } else {
        setErrors({ general: result.message });
      }
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password clicked');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the id_token to backend
      const response = await axios.post(
        '/api/auth/google-login',
        { id_token: idToken },
        { withCredentials: true }
      );

      console.log('Google login response:', response.data);

      const user = response.data.user;

      toast.success('Login successful! Redirecting...');

      // Redirect to my-profile page
      setTimeout(() => navigate('/my-profile'), 2000);
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Show organization status screens if applicable
  if (orgStatus === 'pending') {
    return <AegisOrgPendingApproval organization={orgData} />;
  }

  if (orgStatus === 'rejected') {
    return <AegisOrgRejected organization={orgData} reason={orgReason} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 relative overflow-hidden">
      {/* Background Animations */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-purple-500/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-t from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />

      <div className="relative z-10 min-h-screen flex">

        {/* Left Column: Marketing Text & Mascot */}
        <div className="flex-1 flex-col justify-center items-center text-center px-8 lg:px-16 xl:px-24 max-w-2xl hidden lg:flex">
          <div className="mb-8">
            <AegisLoginMascot />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                Welcome
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  Back, Player.
                </span>
              </h1>
            </div>

            <div className="flex items-center justify-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-400" />
                <span>Instant Access</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Secure Login</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-md space-y-8 bg-black/20 backdrop-blur-md p-8 rounded-2xl border border-white/10">

            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">Sign In</h2>
              <p className="text-gray-400">Enter your credentials to continue</p>
            </div>

            <div className="space-y-6">

              <div className="relative group">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200">
                  <Mail className="w-6 h-6" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full pl-16 pr-6 py-4 bg-gray-900/30 backdrop-blur-sm border-2 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-600/50 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-500/70'
                  }`}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200">
                  <Lock className="w-6 h-6" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-16 pr-16 py-4 bg-gray-900/30 backdrop-blur-sm border-2 rounded-xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-600/50 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-500/70'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>

              {errors.general && (
                <div className="text-red-400 text-sm text-center">
                  {errors.general}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    rememberMe
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-500 group-hover:border-blue-400'
                  }`}>
                    {rememberMe && (
                      <CheckCircle className="w-5 h-5 text-white -m-0.5" />
                    )}
                  </div>
                  <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-lg font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/20 text-gray-400">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-900 font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-3 group"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center text-gray-400">
              Don't have an account?{' '}
              <NavLink to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AegisLogin;