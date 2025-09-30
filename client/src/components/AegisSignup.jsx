import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Gamepad2, Shield, CheckCircle, AlertCircle, ArrowRight, Building2, Phone, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AegisSignup = () => {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
      role: '',
      username: '',
      email: '',
      password: '',
      // Organization-specific fields
      orgName: '',
      country: '',
      headquarters: '',
      description: '',
      contactPhone: '',
      establishedDate: '',
      website: '',
      ownerName: '',
      ownerInstagram: ''
    });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const AegisSignupMascot = () => (
    <div className="relative">
      <div className="w-16 h-20 bg-gradient-to-b from-orange-400 via-red-500 to-amber-600 rounded-t-full rounded-b-lg border-2 border-orange-300 relative overflow-hidden shadow-lg shadow-orange-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-orange-300/20 to-red-400/20 rounded-t-full rounded-b-lg border border-yellow-400/30" />
        
        <div className="absolute top-6 left-3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-6 right-3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-yellow-200/90 rounded-full shadow-sm shadow-yellow-300/60" />
      </div>
      
      <div className="absolute top-6 -left-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform rotate-45 shadow-md shadow-orange-400/50" />
      <div className="absolute top-8 -right-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform -rotate-12 shadow-md shadow-orange-400/50" />
      
      <div className="absolute -top-1 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
      <div className="absolute -top-2 left-2 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}} />
      <div className="absolute top-0 -left-1 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}} />
      
      <div className="absolute inset-0 bg-orange-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-red-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
      
      <div className="absolute -inset-1 bg-gradient-to-b from-yellow-400/30 via-orange-400/30 to-red-500/30 rounded-t-full rounded-b-lg blur-sm -z-30 animate-pulse" style={{animationDuration: '2s'}} />
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role: role
    }));
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Role-specific validation
    if (formData.role === 'player') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

              if (formData.role === 'organization') {
                if (!formData.orgName.trim()) {
                  newErrors.orgName = 'Organization name is required';
                } else if (formData.orgName.length < 3) {
                  newErrors.orgName = 'Organization name must be at least 3 characters';
                }
                if (!formData.ownerName.trim()) {
                  newErrors.ownerName = 'Owner name is required';
                }

      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
      }

      if (formData.contactPhone && !/^[\d\s\+\-\(\)]+$/.test(formData.contactPhone)) {
        newErrors.contactPhone = 'Please enter a valid phone number';
      }
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
    try {
      if (formData.role === 'player') {
        // Player registration (existing flow)
        const response = await axios.post("http://localhost:5000/api/players/signup", {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }, {
          withCredentials: true,
        });

        console.log("Signup response:", response.data);
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);

        } else if (formData.role === 'organization') {
          // Organization registration (new flow)
          const response = await axios.post("http://localhost:5000/api/organizations/register", {
            orgName: formData.orgName,
            email: formData.email,
            password: formData.password,
            country: formData.country,
            headquarters: formData.headquarters,
            description: formData.description,
            contactPhone: formData.contactPhone,
            establishedDate: formData.establishedDate,
            website: formData.website,
            ownerName: formData.ownerName,
            ownerSocial: {
              instagram: formData.ownerInstagram
            }
          }, {
            withCredentials: true,
          });

        console.log("Organization registration response:", response.data);
        toast.success("Organization registration submitted! Pending admin approval.");
        setTimeout(() => navigate('/login'), 2000);
      }

    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(`Registration failed: ${error.response?.data?.message || "Server error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login clicked`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(80)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 4}s` 
            }} 
          />
        ))}
      </div>

      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-red-500/25 to-amber-500/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-t from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />

      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,165,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 min-h-screen flex">
        
        <div className="flex-1 flex flex-col justify-center items-start px-8 lg:px-16 xl:px-24 max-w-2xl">
          <div className="mb-8">
            <AegisSignupMascot />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                Join the
                <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-amber-500 bg-clip-text text-transparent">
                  Elite
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg">
                {formData.role === 'organization' 
                  ? "Register your organization and compete at the highest level."
                  : "Create your Aegis profile and compete with the world's best gamers. Your legendary journey starts here."}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free Forever</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Secure & Private</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full" />
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-5 h-5 text-orange-400" />
                <span>All Games</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 lg:px-16 xl:px-24">
          <div className="w-full max-w-md space-y-8 max-h-[90vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-800">
            
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="text-gray-400">Ready to dominate the leaderboards?</p>
            </div>

            <div className="space-y-6">
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('player')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      formData.role === 'player'
                        ? 'border-orange-500 bg-orange-500/20 text-white shadow-lg shadow-orange-500/30'
                        : 'border-gray-600/50 bg-gray-900/30 text-gray-300 hover:border-gray-500/70'
                    }`}
                  >
                    <User className="w-6 h-6" />
                    <span className="font-medium">Player</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('organization')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      formData.role === 'organization'
                        ? 'border-orange-500 bg-orange-500/20 text-white shadow-lg shadow-orange-500/30'
                        : 'border-gray-600/50 bg-gray-900/30 text-gray-300 hover:border-gray-500/70'
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="font-medium">Organization</span>
                  </button>
                </div>
                {errors.role && (
                  <div className="flex items-center mt-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.role}
                  </div>
                )}
              </div>

              {/* Player Fields */}
              {formData.role === 'player' && (
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                    <User className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.username 
                        ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                        : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                    }`}
                  />
                  {errors.username && (
                    <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {errors.username}
                    </div>
                  )}
                </div>
              )}

              {/* Organization Fields */}
              {formData.role === 'organization' && (
                <>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                      <User className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Owner name"
                      className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        errors.ownerName 
                          ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                          : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                      }`}
                    />
                    {errors.ownerName && (
                      <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.ownerName}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      name="orgName"
                      value={formData.orgName}
                      onChange={handleInputChange}
                      placeholder="Organization name"
                      className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        errors.orgName 
                          ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                          : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                      }`}
                    />
                    {errors.orgName && (
                      <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.orgName}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        errors.country 
                          ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                          : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                      }`}
                    />
                    {errors.country && (
                      <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.country}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <input
                      type="text"
                      name="headquarters"
                      value={formData.headquarters}
                      onChange={handleInputChange}
                      placeholder="Headquarters (optional)"
                      className="w-full px-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 border-gray-600/50 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70 transition-all duration-300"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                      <Phone className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="Contact phone (optional)"
                      className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        errors.contactPhone 
                          ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                          : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                      }`}
                    />
                    {errors.contactPhone && (
                      <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.contactPhone}
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of your organization (optional)"
                      rows="3"
                      className="w-full px-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 border-gray-600/50 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70 transition-all duration-300 resize-none"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      name="ownerInstagram"
                      value={formData.ownerInstagram}
                      onChange={handleInputChange}
                      placeholder="Owner Instagram (optional)"
                      className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        errors.ownerInstagram
                          ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400'
                          : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                      }`}
                    />
                    {errors.ownerInstagram && (
                      <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {errors.ownerInstagram}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="relative group">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                  <Mail className="w-6 h-6" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full pl-16 pr-6 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.email 
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                      : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                  }`}
                />
                {errors.email && (
                  <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 transition-colors duration-200">
                  <Lock className="w-6 h-6" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={`w-full pl-16 pr-16 py-5 bg-gray-900/30 backdrop-blur-sm border-2 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-400' 
                      : 'border-gray-600/50 focus:ring-orange-500/20 focus:border-orange-400 hover:border-gray-500/70'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
                {errors.password && (
                  <div className="flex items-center mt-3 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errors.password}
                  </div>
                )}
              </div>

              {formData.role === 'organization' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Your organization registration will be reviewed by our admin team. You'll receive an email once approved.</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:via-red-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-lg font-bold py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 disabled:scale-100 disabled:shadow-none flex items-center justify-center space-x-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>

              {formData.role === 'player' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSocialLogin('Google')}
                      className="flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      onClick={() => handleSocialLogin('Discord')}
                      className="flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Discord
                    </button>
                  </div>
                </>
              )}

            </div>

            <div className="text-center space-y-4">
              <div className="text-gray-400">
                Already have an account?{' '}
                <NavLink to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                  Log in
                </NavLink>
              </div>
              
              <div className="pt-4 border-t border-gray-600/30">
                <div className="text-xs text-gray-500">
                  🔒 Your data is encrypted and secure • Join 10,000+ gamers
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AegisSignup;