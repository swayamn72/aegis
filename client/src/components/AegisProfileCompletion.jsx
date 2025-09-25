import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Gamepad2, Trophy, MapPin,
  Calendar, Globe, Target, Users, Zap, Shield, Upload,
  Camera, CheckCircle, Star, Award, ArrowRight, Save,
  Clock, Activity, Hash, ExternalLink, Medal, Crown
} from 'lucide-react';

const AegisProfileCompletion = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Info
    realName: '',
    age: '',
    location: '',
    country: '',
    bio: '',
    languages: [],
    profilePicture: '',

    // Gaming Info
    inGameName: '',
    primaryGame: '',
    earnings: '',
    qualifiedEvents: false,
    qualifiedEventDetails: [],
    inGameRole: [],

    // Team & Goals
    teamStatus: '',
    availability: '',

    // Social & Contact
    discordTag: '',
    twitch: '',
    YouTube: '',
    profileVisibility: 'public'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const AegisCompletionMascot = () => (
    <div className="relative">
      <div className="w-20 h-24 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-t-full rounded-b-lg border-2 border-cyan-300 relative overflow-hidden shadow-lg shadow-cyan-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-cyan-300/20 to-purple-400/20 rounded-t-full rounded-b-lg border border-white/30" />
        
        <div className="absolute top-7 left-4 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        <div className="absolute top-7 right-4 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        
        <div className="absolute top-11 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white/90 rounded-full shadow-sm shadow-white/60" />
        
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
      </div>
      
      <div className="absolute top-10 -left-2 w-3 h-6 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform rotate-12 shadow-md shadow-cyan-400/50" />
      <div className="absolute top-10 -right-2 w-3 h-6 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform -rotate-12 shadow-md shadow-cyan-400/50" />
      
      <div className="absolute inset-0 bg-cyan-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: Array.isArray(prev[name]) ? (prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]) : [value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.realName.trim()) newErrors.realName = 'Real name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.primaryGame) newErrors.primaryGame = 'Primary game is required';
    if (!formData.teamStatus) newErrors.teamStatus = 'Team status is required';
    if (!formData.availability) newErrors.availability = 'Availability is required';

    return newErrors;
  };

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        navigate('/my-profile');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 relative overflow-hidden mt-[100px]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s` 
            }} 
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <AegisCompletionMascot />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Complete Your 
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Aegis Profile
              </span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Help us create the perfect gaming profile for you. This information will help other players find and connect with you.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 md:p-12">
            
            {/* Personal Information Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Real Name *</label>
                    <input
                      type="text"
                      name="realName"
                      value={formData.realName}
                      onChange={handleInputChange}
                      placeholder="Enter your real name"
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.realName ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    />
                    {errors.realName && <p className="text-red-400 text-sm mt-1">{errors.realName}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Age *</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Your age"
                      min="13"
                      max="99"
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.age ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    />
                    {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">City/Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.location ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    />
                    {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.country ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Brazil">Brazil</option>
                    </select>
                    {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your gaming journey, and what makes you unique..."
                    rows="4"
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Languages Spoken</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleArrayChange('languages', lang)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          formData.languages.includes(lang)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-zinc-800/50 border-2 border-dashed border-zinc-600 rounded-xl flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onload = (e) => setPreviewUrl(e.target.result);
                            reader.readAsDataURL(file);

                            // Upload immediately
                            setIsUploading(true);
                            try {
                              const formDataUpload = new FormData();
                              formDataUpload.append('profilePicture', file);

                              const response = await fetch('/api/players/upload-pfp', {
                                method: 'POST',
                                credentials: 'include',
                                body: formDataUpload,
                              });

                              const result = await response.json();
                              if (result.profilePicture) {
                                setFormData(prev => ({ ...prev, profilePicture: result.profilePicture }));
                              } else {
                                alert('Upload failed: ' + result.message);
                              }
                            } catch (error) {
                              console.error('Upload error:', error);
                              alert('Upload failed. Please try again.');
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-zinc-400 text-sm mb-2">
                        Upload a profile picture (max 5MB, image files only)
                      </p>
                      {isUploading && (
                        <div className="flex items-center gap-2 text-cyan-400">
                          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                          Uploading...
                        </div>
                      )}
                      {formData.profilePicture && !isUploading && (
                        <p className="text-green-400 text-sm">✓ Profile picture uploaded successfully</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Information Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Gamepad2 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Gaming Profile</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">In-Game Name</label>
                    <input
                      type="text"
                      name="inGameName"
                      value={formData.inGameName}
                      onChange={handleInputChange}
                      placeholder="Your in-game username"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Primary Game *</label>
                    <select
                      name="primaryGame"
                      value={formData.primaryGame}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.primaryGame ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    >
                      <option value="">Select Your Main Game</option>
                      <option value="BGMI">BGMI</option>
                      <option value="VALO">VALO</option>
                      <option value="CS2">CS2</option>
                    </select>
                    {errors.primaryGame && <p className="text-red-400 text-sm mt-1">{errors.primaryGame}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Earnings So Far</label>
                    <input
                      type="number"
                      name="earnings"
                      value={formData.earnings}
                      onChange={handleInputChange}
                      placeholder="Total earnings (in INR or USD)"
                      min="0"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Qualified for Official Events?</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="qualifiedEvents"
                        checked={formData.qualifiedEvents}
                        onChange={(e) => setFormData(prev => ({ ...prev, qualifiedEvents: e.target.checked }))}
                        className="w-4 h-4 text-cyan-600 bg-zinc-800/50 border-zinc-600 rounded focus:ring-cyan-500/20 focus:ring-2"
                      />
                      <span className="ml-2 text-zinc-300">Yes, I have qualified for official events</span>
                    </div>
                  </div>
                </div>

                {formData.qualifiedEvents && (
                  <div>
                    <label className="block text-white font-medium mb-2">Details of Qualified Events</label>
                    <div className="space-y-3">
                      {formData.qualifiedEventDetails.map((event, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={event}
                            onChange={(e) => {
                              const newDetails = [...formData.qualifiedEventDetails];
                              newDetails[index] = e.target.value;
                              setFormData(prev => ({ ...prev, qualifiedEventDetails: newDetails }));
                            }}
                            placeholder="e.g., BGIS 2024"
                            className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newDetails = formData.qualifiedEventDetails.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, qualifiedEventDetails: newDetails }));
                            }}
                            className="px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, qualifiedEventDetails: [...prev.qualifiedEventDetails, ''] }))}
                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                      >
                        Add Event
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white font-medium mb-3">In-Game Role</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['assaulter', 'IGL', 'support', 'filter', 'sniper'].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleArrayChange('inGameRole', role)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          Array.isArray(formData.inGameRole) && formData.inGameRole.includes(role)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Goals Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Team & Goals</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Team Status *</label>
                    <select
                      name="teamStatus"
                      value={formData.teamStatus}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.teamStatus ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    >
                      <option value="">Select Status</option>
                      <option value="looking for a team">Looking for a team</option>
                      <option value="in a team">In a team</option>
                      <option value="open for offers">Open for offers</option>
                    </select>
                    {errors.teamStatus && <p className="text-red-400 text-sm mt-1">{errors.teamStatus}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Availability *</label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.availability ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    >
                      <option value="">Select Availability</option>
                      <option value="weekends only">Weekends only</option>
                      <option value="evenings">Evenings</option>
                      <option value="flexible">Flexible</option>
                      <option value="full time">Full time</option>
                    </select>
                    {errors.availability && <p className="text-red-400 text-sm mt-1">{errors.availability}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Social & Contact Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Social & Contact</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Discord Tag</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      name="discordTag"
                      value={formData.discordTag}
                      onChange={handleInputChange}
                      placeholder="username#1234"
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Twitch</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        name="twitch"
                        value={formData.twitch}
                        onChange={handleInputChange}
                        placeholder="twitch.tv/username"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">YouTube</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        name="YouTube"
                        value={formData.YouTube}
                        onChange={handleInputChange}
                        placeholder="youtube.com/@username"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Profile Visibility</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can view your profile', icon: Globe },
                      { value: 'friends', label: 'Friends Only', desc: 'Only friends can see details', icon: Users },
                      { value: 'private', label: 'Private', desc: 'Hidden from searches', icon: Shield }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profileVisibility: option.value }))}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          formData.profileVisibility === option.value
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <option.icon className="w-6 h-6 mb-2" />
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-zinc-400">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">Privacy & Safety</h3>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        Your profile information helps us match you with compatible players and teams. 
                        You can always update your privacy settings and control what information is visible to others.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-6 mt-12 pt-8 border-t border-zinc-700">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold px-12 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 disabled:scale-100 disabled:shadow-none text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Complete Profile
                  </>
                )}
              </button>

              {/* Skip Option */}
              <button className="text-zinc-400 hover:text-zinc-300 text-sm font-medium transition-colors">
                Skip for now, I'll complete this later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AegisProfileCompletion;