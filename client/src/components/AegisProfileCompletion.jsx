import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, User, Gamepad2, Trophy, MapPin, 
  Calendar, Globe, Target, Users, Zap, Shield, Upload, 
  Camera, CheckCircle, Star, Award, ArrowRight, Save,
  Clock, Activity, Hash, ExternalLink, Medal, Crown
} from 'lucide-react';

const AegisProfileCompletion = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info (Step 1)
    realName: '',
    age: '',
    location: '',
    country: '',
    bio: '',
    languages: [],
    
    // Gaming Info (Step 2)
    primaryGame: '',
    experienceYears: '',
    earnings: '',
    qualifiedEvents: 'no',
    qualifiedEventsDetails: '',
    playstyle: '',
    
    // Team & Goals (Step 3)
    teamStatus: '',
    lookingFor: [],
    availability: '',
    competitiveGoals: '',
    preferredGameModes: [],
    
    // Social & Contact (Step 4)
    discordTag: '',
    twitterHandle: '',
    twitchChannel: '',
    youtubeChannel: '',
    profileVisibility: 'public'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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
      [name]: prev[name].includes(value) 
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.realName.trim()) newErrors.realName = 'Real name is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;
      case 2:
        if (!formData.primaryGame) newErrors.primaryGame = 'Primary game is required';
        if (!formData.experienceYears) newErrors.experienceYears = 'Experience is required';
        break;
      case 3:
        if (!formData.teamStatus) newErrors.teamStatus = 'Team status is required';
        if (!formData.availability) newErrors.availability = 'Availability is required';
        break;
      case 4:
        // Optional step, no required fields
        break;
    }
    
    return newErrors;
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    alert('Profile completed successfully!');
  };

  const stepTitles = {
    1: 'Personal Information',
    2: 'Gaming Profile',
    3: 'Team & Goals',
    4: 'Social & Contact'
  };

  const stepDescriptions = {
    1: 'Tell us about yourself',
    2: 'Your gaming credentials',
    3: 'What are you looking for?',
    4: 'Connect with the community'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 relative overflow-hidden">
      
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

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-400 text-sm">Step {currentStep} of {totalSteps}</span>
              <span className="text-zinc-400 text-sm">{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 md:p-12">
            
            {/* Step Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{stepTitles[currentStep]}</h2>
              <p className="text-zinc-400">{stepDescriptions[currentStep]}</p>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
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
              </div>
            )}

            {/* Step 2: Gaming Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <option value="BGMI">BGMI (Battlegrounds Mobile India)</option>
                      <option value="PUBG Mobile">PUBG Mobile</option>
                      <option value="Free Fire">Free Fire</option>
                      <option value="Call of Duty Mobile">Call of Duty Mobile</option>
                      <option value="Valorant Mobile">Valorant Mobile</option>
                    </select>
                    {errors.primaryGame && <p className="text-red-400 text-sm mt-1">{errors.primaryGame}</p>}
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Experience (in years) *</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="Years of experience"
                      min="0"
                      className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.experienceYears ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-600 focus:ring-cyan-500/20 focus:border-cyan-400'
                      }`}
                    />
                    {errors.experienceYears && <p className="text-red-400 text-sm mt-1">{errors.experienceYears}</p>}
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
                    <select
                      name="qualifiedEvents"
                      value={formData.qualifiedEvents}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                {formData.qualifiedEvents === 'yes' && (
                  <div>
                    <label className="block text-white font-medium mb-2">Details of Qualified Events</label>
                    <textarea
                      name="qualifiedEventsDetails"
                      value={formData.qualifiedEventsDetails}
                      onChange={handleInputChange}
                      placeholder="Mention the official events you have qualified for (e.g., BGIS 2024, PMGC 2023)..."
                      rows="4"
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white font-medium mb-3">Playstyle</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Aggressive', 'Passive', 'Balanced', 'Sniper', 'Rusher', 'Support', 'Leader', 'Flex'].map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, playstyle: style }))}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          formData.playstyle === style
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Team & Goals */}
            {currentStep === 3 && (
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
                      <option value="Looking for Team">Looking for Team</option>
                      <option value="In a Team">Currently in a Team</option>
                      <option value="Team Captain">Team Captain/Leader</option>
                      <option value="Solo Player">Solo Player</option>
                      <option value="Open to Offers">Open to Team Offers</option>
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
                      <option value="Weekends Only">Weekends Only</option>
                      <option value="Evenings (6-11 PM)">Evenings (6-11 PM)</option>
                      <option value="Flexible Schedule">Flexible Schedule</option>
                      <option value="Full-time Available">Full-time Available</option>
                      <option value="Part-time (20+ hrs/week)">Part-time (20+ hrs/week)</option>
                    </select>
                    {errors.availability && <p className="text-red-400 text-sm mt-1">{errors.availability}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">What are you looking for?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Competitive Team', 'Casual Gaming', 'Tournament Play', 'Rank Climbing',
                      'Coaching/Mentoring', 'Content Creation', 'Practice Partners', 'Community Building'
                    ].map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleArrayChange('lookingFor', goal)}
                        className={`px-4 py-2 rounded-lg border transition-all text-left ${
                          formData.lookingFor.includes(goal)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Preferred Game Modes</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Classic', 'TDM', 'Domination', 'Payload', 'Arena', 'Custom Rooms', 'Tournament Mode', 'Arcade'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleArrayChange('preferredGameModes', mode)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          formData.preferredGameModes.includes(mode)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Competitive Goals</label>
                  <textarea
                    name="competitiveGoals"
                    value={formData.competitiveGoals}
                    onChange={handleInputChange}
                    placeholder="What are your competitive gaming goals? (e.g., reach Conqueror, join pro team, win tournaments...)"
                    rows="3"
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Social & Contact */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-white font-medium mb-2">Twitter Handle</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        name="twitterHandle"
                        value={formData.twitterHandle}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Twitch Channel</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        name="twitchChannel"
                        value={formData.twitchChannel}
                        onChange={handleInputChange}
                        placeholder="twitch.tv/username"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">YouTube Channel</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        name="youtubeChannel"
                        value={formData.youtubeChannel}
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
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-zinc-700">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-700/50 hover:bg-zinc-600/50 text-white font-medium rounded-xl transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 disabled:scale-100 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Complete Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-3">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step < currentStep ? 'bg-green-500' :
                      step === currentStep ? 'bg-cyan-500 animate-pulse' :
                      'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-6">
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