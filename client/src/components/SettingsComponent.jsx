import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Settings, User, Bell, Mail, Shield, Download, HelpCircle,
  Bug, MessageSquare, Trash2, ExternalLink, Eye, EyeOff,
  Save, X, Check, AlertTriangle, Globe, Smartphone, Monitor,
  Lock, Key, Unlink, Github, Twitch,
  Volume2, VolumeX, Zap, Crown, Trophy, Star, Upload
} from 'lucide-react';
import { FaDiscord, FaSteam } from 'react-icons/fa';

const SettingsComponent = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // New state for support form
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('Account Issues');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  // New state for bug report form
  const [bugTitle, setBugTitle] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugPriority, setBugPriority] = useState('Low');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Optional: Update profileSettings.profilePicture with a preview URL or base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileSettings(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
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
    profileVisibility: 'public',

    // Appearance
    cardTheme: 'orange'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      newsletter: true,
      updates: true,
      promotional: false,
      security: true,
      matchResults: true,
      tournamentInvites: true
    },
    push: {
      browser: true,
      mobile: true,
      matchUpdates: true,
      friendRequests: true,
      messages: true,
      achievements: true
    },
    inApp: {
      sounds: true,
      vibration: true,
      popups: true,
      badges: true
    },
    sms: {
      enabled: false,
      security: true,
      tournaments: false
    }
  });

  // Linked accounts state
  const [linkedAccounts, setLinkedAccounts] = useState({
    steam: { connected: true, username: 'zyaxxxx_gaming' },
    discord: { connected: true, username: 'Zyaxxxx#1337' },
    twitch: { connected: true, username: 'zyaxxxx_gaming' },
    youtube: { connected: false, username: '' },
    github: { connected: false, username: '' }
  });

  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    cardTheme: 'orange', // Default theme
  });

  const AegisMascot = () => (
    <div className="relative">
      <div className="w-12 h-14 bg-gradient-to-b from-orange-400 via-red-500 to-amber-600 rounded-t-full rounded-b-lg border border-orange-300 relative overflow-hidden shadow-lg shadow-orange-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-300/30 rounded-full" />
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-200/40 rounded-full" />
        </div>
        <div className="absolute top-4 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-4 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-yellow-200/90 rounded-full" />
      </div>
    </div>
  );

  const showSaveMessage = (message) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // Fetch current user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/players/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Map backend data to profileSettings state shape
          setProfileSettings({
            realName: data.realName || '',
            age: data.age || '',
            location: data.location || '',
            country: data.country || '',
            bio: data.bio || '',
            languages: data.languages || [],
            profilePicture: data.profilePicture || '',
            inGameName: data.inGameName || '',
            primaryGame: data.primaryGame || '',
            earnings: data.earnings || '',
            qualifiedEvents: data.qualifiedEvents || false,
            qualifiedEventDetails: data.qualifiedEventDetails || [],
            inGameRole: data.inGameRole || [],
            teamStatus: data.teamStatus || '',
            availability: data.availability || '',
            discordTag: data.discordTag || '',
            twitch: data.twitch || '',
            YouTube: data.YouTube || '',
            profileVisibility: data.profileVisibility || 'public',
            cardTheme: data.cardTheme || 'orange',
          });
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);
  
  // Submit updated profile to backend
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // If there's a selected file, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        const uploadResponse = await fetch('/api/players/upload-pfp', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.message || 'Failed to upload profile picture');
        }

        const uploadData = await uploadResponse.json();
        // Update profileSettings with the new profilePicture URL
        setProfileSettings(prev => ({ ...prev, profilePicture: uploadData.profilePicture }));
        setSelectedFile(null); // Clear selected file after upload
      }

      // Now update the profile with other settings
      const response = await fetch('/api/players/update-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileSettings),
      });
      if (response.ok) {
        const data = await response.json();
        showSaveMessage('Profile settings saved successfully!');
        toast.success('Profile settings saved successfully!');
        setProfileSettings(prev => ({ ...prev, ...data.player }));
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to save profile';
        const validationErrors = errorData.errors ? Object.values(errorData.errors).map(e => e.message).join(', ') : '';
        showSaveMessage(`Error: ${errorMessage}${validationErrors ? ' - ' + validationErrors : ''}`);
        toast.error(`Error: ${errorMessage}${validationErrors ? ' - ' + validationErrors : ''}`);
      }
    } catch (error) {
      showSaveMessage('Error saving profile');
      toast.error('Error saving profile');
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const SettingsSection = ({ id, title, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' 
          : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{title}</span>
    </button>
  );

  const ToggleSwitch = ({ enabled, onChange, size = 'default' }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center ${
        size === 'small' ? 'h-5 w-9' : 'h-6 w-11'
      } rounded-full transition-colors duration-200 ${
        enabled ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-zinc-600'
      }`}
    >
      <span
        className={`inline-block ${
          size === 'small' ? 'h-3 w-3' : 'h-4 w-4'
        } rounded-full bg-white transition-transform duration-200 ${
          enabled ? (size === 'small' ? 'translate-x-5' : 'translate-x-6') : 'translate-x-1'
        }`}
      />
    </button>
  );

  const AccountCard = ({ platform, icon: Icon, account, onToggle, color = 'orange' }) => (
    <div className={`bg-zinc-800/50 border border-zinc-700 rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${
            color === 'blue' ? 'from-blue-500 to-blue-600' :
            color === 'purple' ? 'from-purple-500 to-purple-600' :
            color === 'red' ? 'from-red-500 to-red-600' :
            color === 'zinc' ? 'from-zinc-500 to-zinc-600' :
            'from-orange-500 to-orange-600'
          } rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-medium capitalize">{platform}</div>
            {account.connected && (
              <div className="text-zinc-400 text-sm">{account.username}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {account.connected && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Connected</span>
          )}
          <button
            onClick={() => onToggle(platform)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              account.connected 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
            }`}
          >
            {account.connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <AegisMascot />
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-zinc-400">Manage your account preferences and privacy settings</p>
            </div>
          </div>
          
          {savedMessage && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">{savedMessage}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sticky top-[calc(5rem+1rem)] z-20">
              <nav className="space-y-2">
                <SettingsSection
                  id="profile"
                  title="Edit Profile"
                  icon={User}
                  isActive={activeSection === 'profile'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="accounts"
                  title="Linked Accounts"
                  icon={ExternalLink}
                  isActive={activeSection === 'accounts'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="notifications"
                  title="Notifications"
                  icon={Bell}
                  isActive={activeSection === 'notifications'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="privacy"
                  title="Privacy & Security"
                  icon={Shield}
                  isActive={activeSection === 'privacy'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="data"
                  title="Data & Export"
                  icon={Download}
                  isActive={activeSection === 'data'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="support"
                  title="Support & Help"
                  icon={HelpCircle}
                  isActive={activeSection === 'support'}
                  onClick={setActiveSection}
                />
                <SettingsSection
                  id="danger"
                  title="Account Deletion"
                  icon={Trash2}
                  isActive={activeSection === 'danger'}
                  onClick={setActiveSection}
                />
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Edit Profile Section */}
            {activeSection === 'profile' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-orange-400" />
                  Edit Profile
                </h2>
                
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Real Name *</label>
                        <input
                          type="text"
                          value={profileSettings.realName}
                          onChange={(e) => setProfileSettings({...profileSettings, realName: e.target.value})}
                          placeholder="Enter your real name"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Age *</label>
                        <input
                          type="number"
                          value={profileSettings.age}
                          onChange={(e) => setProfileSettings({...profileSettings, age: e.target.value})}
                          placeholder="Your age"
                          min="13"
                          max="99"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">City/Location *</label>
                        <input
                          type="text"
                          value={profileSettings.location}
                          onChange={(e) => setProfileSettings({...profileSettings, location: e.target.value})}
                          placeholder="e.g., Mumbai, Maharashtra"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Country *</label>
                        <select
                          value={profileSettings.country}
                          onChange={(e) => setProfileSettings({...profileSettings, country: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
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
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-2">Bio</label>
                      <textarea
                        value={profileSettings.bio}
                        onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                        placeholder="Tell us about yourself, your gaming journey, and what makes you unique..."
                        rows={4}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-3">Languages Spoken</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi'].map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              const newLanguages = profileSettings.languages.includes(lang)
                                ? profileSettings.languages.filter(l => l !== lang)
                                : [...profileSettings.languages, lang];
                              setProfileSettings({...profileSettings, languages: newLanguages});
                            }}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              profileSettings.languages.includes(lang)
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Profile Picture Upload */}
                    <div>
                      <label className="block text-zinc-300 font-medium mb-2">Profile Picture</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-red-600 file:text-white hover:file:from-orange-600 hover:file:to-red-700"
                        />
                        {selectedFile && (
                          <div className="flex items-center gap-4">
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setProfileSettings(prev => ({ ...prev, profilePicture: '' }));
                              }}
                              className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {profileSettings.profilePicture && !selectedFile && (
                          <img
                            src={profileSettings.profilePicture}
                            alt="Current profile"
                            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-600"
                          />
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mt-2">Upload a square image (recommended: 400x400px, max 5MB)</p>
                    </div>
                  </div>

                  {/* Gaming Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Gaming Profile</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">In-Game Name</label>
                        <input
                          type="text"
                          value={profileSettings.inGameName}
                          onChange={(e) => setProfileSettings({...profileSettings, inGameName: e.target.value})}
                          placeholder="Your in-game username"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Primary Game *</label>
                        <select
                          value={profileSettings.primaryGame}
                          onChange={(e) => setProfileSettings({...profileSettings, primaryGame: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Select Your Main Game</option>
                          <option value="BGMI">BGMI</option>
                          <option value="VALO">VALO</option>
                          <option value="CS2">CS2</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Earnings So Far</label>
                        <input
                          type="number"
                          value={profileSettings.earnings}
                          onChange={(e) => setProfileSettings({...profileSettings, earnings: e.target.value})}
                          placeholder="Total earnings (in INR or USD)"
                          min="0"
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Qualified for Official Events?</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileSettings.qualifiedEvents}
                            onChange={(e) => setProfileSettings({...profileSettings, qualifiedEvents: e.target.checked})}
                            className="w-4 h-4 text-orange-600 bg-zinc-800 border-zinc-600 rounded focus:ring-orange-500/20 focus:ring-2"
                          />
                          <span className="ml-2 text-zinc-300">Yes, I have qualified for official events</span>
                        </div>
                      </div>
                    </div>

                    {profileSettings.qualifiedEvents && (
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Details of Qualified Events</label>
                        <div className="space-y-3">
                          {profileSettings.qualifiedEventDetails.map((event, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={event}
                                onChange={(e) => {
                                  const newDetails = [...profileSettings.qualifiedEventDetails];
                                  newDetails[index] = e.target.value;
                                  setProfileSettings({...profileSettings, qualifiedEventDetails: newDetails});
                                }}
                                placeholder="e.g., BGIS 2024"
                                className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDetails = profileSettings.qualifiedEventDetails.filter((_, i) => i !== index);
                                  setProfileSettings({...profileSettings, qualifiedEventDetails: newDetails});
                                }}
                                className="px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setProfileSettings({...profileSettings, qualifiedEventDetails: [...profileSettings.qualifiedEventDetails, '']})}
                            className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all"
                          >
                            Add Event
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-zinc-300 font-medium mb-3">In-Game Role</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['assaulter', 'IGL', 'support', 'filter', 'sniper'].map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              const newRoles = profileSettings.inGameRole.includes(role)
                                ? profileSettings.inGameRole.filter(r => r !== role)
                                : [...profileSettings.inGameRole, role];
                              setProfileSettings({...profileSettings, inGameRole: newRoles});
                            }}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              profileSettings.inGameRole.includes(role)
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Team & Goals Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Team & Goals</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Team Status *</label>
                        <select
                          value={profileSettings.teamStatus}
                          onChange={(e) => setProfileSettings({...profileSettings, teamStatus: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Select Status</option>
                          <option value="looking for a team">Looking for a team</option>
                          <option value="in a team">In a team</option>
                          <option value="open for offers">Open for offers</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Availability *</label>
                        <select
                          value={profileSettings.availability}
                          onChange={(e) => setProfileSettings({...profileSettings, availability: e.target.value})}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Select Availability</option>
                          <option value="weekends only">Weekends only</option>
                          <option value="evenings">Evenings</option>
                          <option value="flexible">Flexible</option>
                          <option value="full time">Full time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Social & Contact Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Social & Contact</h3>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-2">Discord Tag</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400">#</span>
                        <input
                          type="text"
                          value={profileSettings.discordTag}
                          onChange={(e) => setProfileSettings({...profileSettings, discordTag: e.target.value})}
                          placeholder="username#1234"
                          className="w-full pl-12 pr-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Twitch</label>
                        <input
                          type="text"
                          value={profileSettings.twitch}
                          onChange={(e) => setProfileSettings({...profileSettings, twitch: e.target.value})}
                          placeholder="twitch.tv/username"
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">YouTube</label>
                        <input
                          type="text"
                          value={profileSettings.YouTube}
                          onChange={(e) => setProfileSettings({...profileSettings, YouTube: e.target.value})}
                          placeholder="youtube.com/@username"
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-3">Profile Visibility</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                          { value: 'friends', label: 'Friends Only', desc: 'Only friends can see details' },
                          { value: 'private', label: 'Private', desc: 'Hidden from searches' }
                        ].map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setProfileSettings({...profileSettings, profileVisibility: option.value})}
                            className={`p-4 rounded-xl border transition-all text-left ${
                              profileSettings.profileVisibility === option.value
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                : 'bg-zinc-800/50 border-zinc-600 text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-zinc-400">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-medium mb-2">Card Theme</label>
                      <select
                        value={profileSettings.cardTheme}
                        onChange={(e) => setProfileSettings({...profileSettings, cardTheme: e.target.value})}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      >
                        <option value="orange">Orange (Default)</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                        <option value="green">Green</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-zinc-700">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={`bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                          isSaving ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    <button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white font-medium px-6 py-2 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Accounts Section */}
            {activeSection === 'accounts' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <ExternalLink className="w-6 h-6 text-orange-400" />
                  Linked Accounts
                </h2>
                
                <p className="text-zinc-400 mb-6">
                  Connect your gaming and social accounts to enhance your Aegis experience
                </p>

                <div className="space-y-4">
                  <AccountCard
                    platform="steam"
                    icon={FaSteam}
                    account={linkedAccounts.steam}
                    onToggle={(platform) => {
                      setLinkedAccounts({
                        ...linkedAccounts,
                        [platform]: {
                          ...linkedAccounts[platform],
                          connected: !linkedAccounts[platform].connected
                        }
                      });
                      showSaveMessage(`Steam account ${linkedAccounts[platform].connected ? 'disconnected' : 'connected'}`);
                    }}
                    color="blue"
                  />
                  
                  <AccountCard
                    platform="discord"
                    icon={FaDiscord}
                    account={linkedAccounts.discord}
                    onToggle={(platform) => {
                      setLinkedAccounts({
                        ...linkedAccounts,
                        [platform]: {
                          ...linkedAccounts[platform],
                          connected: !linkedAccounts[platform].connected
                        }
                      });
                      showSaveMessage(`Discord account ${linkedAccounts[platform].connected ? 'disconnected' : 'connected'}`);
                    }}
                    color="purple"
                  />

                  <AccountCard
                    platform="twitch"
                    icon={Twitch}
                    account={linkedAccounts.twitch}
                    onToggle={(platform) => {
                      setLinkedAccounts({
                        ...linkedAccounts,
                        [platform]: {
                          ...linkedAccounts[platform],
                          connected: !linkedAccounts[platform].connected
                        }
                      });
                      showSaveMessage(`Twitch account ${linkedAccounts[platform].connected ? 'disconnected' : 'connected'}`);
                    }}
                    color="purple"
                  />

                  <AccountCard
                    platform="youtube"
                    icon={Globe}
                    account={linkedAccounts.youtube}
                    onToggle={(platform) => {
                      setLinkedAccounts({
                        ...linkedAccounts,
                        [platform]: {
                          ...linkedAccounts[platform],
                          connected: !linkedAccounts[platform].connected
                        }
                      });
                      showSaveMessage(`YouTube account ${linkedAccounts[platform].connected ? 'disconnected' : 'connected'}`);
                    }}
                    color="red"
                  />

                  <AccountCard
                    platform="github"
                    icon={Github}
                    account={linkedAccounts.github}
                    onToggle={(platform) => {
                      setLinkedAccounts({
                        ...linkedAccounts,
                        [platform]: {
                          ...linkedAccounts[platform],
                          connected: !linkedAccounts[platform].connected
                        }
                      });
                      showSaveMessage(`GitHub account ${linkedAccounts[platform].connected ? 'disconnected' : 'connected'}`);
                    }}
                    color="zinc"
                  />
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Bell className="w-6 h-6 text-orange-400" />
                  Notification Preferences
                </h2>

                <div className="space-y-8">
                  
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-400" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries({
                        newsletter: 'Newsletter & Updates',
                        updates: 'Platform Updates',
                        promotional: 'Promotional Offers',
                        security: 'Security Alerts',
                        matchResults: 'Match Results',
                        tournamentInvites: 'Tournament Invitations'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="text-zinc-300">{label}</div>
                          <ToggleSwitch
                            enabled={notificationSettings.email[key]}
                            onChange={(enabled) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {...notificationSettings.email, [key]: enabled}
                              })
                            }
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries({
                        browser: 'Browser Notifications',
                        mobile: 'Mobile App Notifications',
                        matchUpdates: 'Match Updates',
                        friendRequests: 'Friend Requests',
                        messages: 'Direct Messages',
                        achievements: 'Achievement Unlocks'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="text-zinc-300">{label}</div>
                          <ToggleSwitch
                            enabled={notificationSettings.push[key]}
                            onChange={(enabled) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                push: {...notificationSettings.push, [key]: enabled}
                              })
                            }
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-App Notifications */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-purple-400" />
                      In-App Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries({
                        sounds: 'Notification Sounds',
                        vibration: 'Vibration (Mobile)',
                        popups: 'Pop-up Notifications',
                        badges: 'Badge Notifications'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="text-zinc-300">{label}</div>
                          <ToggleSwitch
                            enabled={notificationSettings.inApp[key]}
                            onChange={(enabled) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                inApp: {...notificationSettings.inApp, [key]: enabled}
                              })
                            }
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries({
                        enabled: 'Enable SMS Notifications',
                        security: 'Security Alerts Only',
                        tournaments: 'Tournament Updates'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="text-zinc-300">{label}</div>
                          <ToggleSwitch
                            enabled={notificationSettings.sms[key]}
                            onChange={(enabled) => 
                              setNotificationSettings({
                                ...notificationSettings,
                                sms: {...notificationSettings.sms, [key]: enabled}
                              })
                            }
                            size="small"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-zinc-700">
                    <button
                      onClick={() => showSaveMessage('Notification preferences saved!')}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Section */}
            {activeSection === 'privacy' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-400" />
                  Privacy & Security
                </h2>

                <div className="space-y-6">
                  <div className="bg-zinc-800/50 border border-amber-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      />
                      <button className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 border border-blue-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Add an extra layer of security to your account with 2FA
                    </p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Privacy Controls</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Profile Visibility</div>
                          <div className="text-zinc-400 text-sm">Who can view your profile</div>
                        </div>
                        <select className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Match History</div>
                          <div className="text-zinc-400 text-sm">Who can see your match history</div>
                        </div>
                        <select className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Export Section */}
            {activeSection === 'data' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Download className="w-6 h-6 text-orange-400" />
                  Data & Export
                </h2>

                <div className="space-y-6">
                  <div className="bg-zinc-800/50 border border-green-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Your Data
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4">
                      Download a copy of all your data including profile information, match history, and statistics
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Profile Data (JSON)
                      </button>
                      <button className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Match History (CSV)
                      </button>
                      <button className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Statistics Report
                      </button>
                      <button className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Complete Archive
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Data Usage</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Profile Data</span>
                        <span className="text-zinc-400 text-sm">2.3 MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Match History</span>
                        <span className="text-zinc-400 text-sm">15.7 MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Screenshots & Media</span>
                        <span className="text-zinc-400 text-sm">248.9 MB</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-zinc-600 pt-4">
                        <span className="text-white font-medium">Total Data</span>
                        <span className="text-orange-400 font-medium">266.9 MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <h3 className="text-amber-400 font-semibold mb-2">Important Notice</h3>
                    <p className="text-amber-300 text-sm">
                      Data exports may take up to 24 hours to process. You'll receive an email when your download is ready.
                      Downloads are available for 7 days after generation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Support & Help Section */}
            {activeSection === 'support' && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-orange-400" />
                  Support & Help
                </h2>

                <div className="space-y-6">
                  
                  {/* Contact Support */}
                  <div className="bg-zinc-800/50 border border-blue-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Contact Support
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Subject</label>
                        <input
                          type="text"
                          placeholder="Brief description of your issue"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Category</label>
                        <select
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option>Account Issues</option>
                          <option>Technical Problems</option>
                          <option>Billing & Payments</option>
                          <option>Feature Requests</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Message</label>
                        <textarea
                          placeholder="Describe your issue in detail..."
                          rows={4}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!supportSubject || !supportCategory || !supportMessage) {
                            toast.error('Please fill all fields in Contact Support');
                            return;
                          }
                          setIsSubmittingSupport(true);
                          try {
                            const response = await fetch('/api/support/contact', {
                              method: 'POST',
                              credentials: 'include',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                subject: supportSubject,
                                category: supportCategory,
                                message: supportMessage,
                              }),
                            });
                            if (response.ok) {
                              toast.success('Support request submitted successfully');
                              setSupportSubject('');
                              setSupportCategory('Account Issues');
                              setSupportMessage('');
                            } else {
                              const errorData = await response.json();
                              toast.error(errorData.message || 'Failed to submit support request');
                            }
                          } catch (error) {
                            toast.error('Failed to submit support request');
                          } finally {
                            setIsSubmittingSupport(false);
                          }
                        }}
                        disabled={isSubmittingSupport}
                        className={`bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          isSubmittingSupport ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Send Message
                      </button>
                    </div>
                  </div>

                  {/* Report a Bug */}
                  <div className="bg-zinc-800/50 border border-red-400/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <Bug className="w-5 h-5" />
                      Report a Bug
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Bug Title</label>
                        <input
                          type="text"
                          placeholder="Short description of the bug"
                          value={bugTitle}
                          onChange={(e) => setBugTitle(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Steps to Reproduce</label>
                        <textarea
                          placeholder="1. Go to...&#10;2. Click on...&#10;3. Expected vs Actual result..."
                          rows={4}
                          value={bugSteps}
                          onChange={(e) => setBugSteps(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-medium mb-2">Priority</label>
                        <select
                          value={bugPriority}
                          onChange={(e) => setBugPriority(e.target.value)}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                      <button
                        onClick={async () => {
                          if (!bugTitle || !bugSteps) {
                            toast.error('Please fill all required fields in Bug Report');
                            return;
                          }
                          setIsSubmittingBug(true);
                          try {
                            const response = await fetch('/api/support/bug', {
                              method: 'POST',
                              credentials: 'include',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: bugTitle,
                                stepsToReproduce: bugSteps,
                                priority: bugPriority,
                              }),
                            });
                            if (response.ok) {
                              toast.success('Bug report submitted successfully');
                              setBugTitle('');
                              setBugSteps('');
                              setBugPriority('Low');
                            } else {
                              const errorData = await response.json();
                              toast.error(errorData.message || 'Failed to submit bug report');
                            }
                          } catch (error) {
                            toast.error('Failed to submit bug report');
                          } finally {
                            setIsSubmittingBug(false);
                          }
                        }}
                        disabled={isSubmittingBug}
                        className={`bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          isSubmittingBug ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        <Bug className="w-4 h-4" />
                        Submit Bug Report
                      </button>
                    </div>
                  </div>

                  {/* Help Resources */}
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Help Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="#"
                        className="flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                      >
                        <HelpCircle className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium group-hover:text-orange-400 transition-colors">FAQ</div>
                          <div className="text-zinc-400 text-sm">Frequently asked questions</div>
                        </div>
                      </a>
                      
                      <a
                        href="#"
                        className="flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                      >
                        <Globe className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white font-medium group-hover:text-blue-400 transition-colors">Help Center</div>
                          <div className="text-zinc-400 text-sm">Complete documentation</div>
                        </div>
                      </a>

                      <a
                        href="#"
                        className="flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                      >
                        <MessageSquare className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium group-hover:text-green-400 transition-colors">Community</div>
                          <div className="text-zinc-400 text-sm">Join our Discord server</div>
                        </div>
                      </a>

                      <a
                        href="#"
                        className="flex items-center gap-3 p-3 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                      >
                        <ExternalLink className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-white font-medium group-hover:text-purple-400 transition-colors">Status Page</div>
                          <div className="text-zinc-400 text-sm">Service status updates</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Deletion Section */}
            {activeSection === 'danger' && (
              <div className="bg-zinc-900/50 border border-red-500/50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
                  <Trash2 className="w-6 h-6" />
                  Danger Zone
                </h2>

                <div className="space-y-6">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h3 className="text-xl font-semibold text-red-400">Delete Account</h3>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <p className="text-zinc-300">
                        Once you delete your account, there is no going back. This action cannot be undone.
                      </p>
                      
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-400 font-medium mb-2">This will permanently delete:</h4>
                        <ul className="text-zinc-300 text-sm space-y-1 list-disc list-inside">
                          <li>Your profile and all personal information</li>
                          <li>All match history and statistics</li>
                          <li>Tournament participation records</li>
                          <li>Friend connections and messages</li>
                          <li>Achievement progress and rewards</li>
                          <li>Any premium features or subscriptions</li>
                        </ul>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-red-800/50 border border-red-500/50 rounded-lg p-4">
                          <p className="text-red-300 font-medium mb-3">
                            Are you absolutely sure? This action cannot be undone.
                          </p>
                          <div className="mb-4">
                            <label className="block text-red-300 text-sm font-medium mb-2">
                              Type "DELETE" to confirm:
                            </label>
                            <input
                              type="text"
                              placeholder="DELETE"
                              className="w-full bg-red-900/50 border border-red-500/50 rounded-lg px-4 py-2 text-white focus:border-red-400 focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Permanently Delete Account
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="bg-zinc-600 hover:bg-zinc-500 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Alternative Options
                    </h4>
                    <p className="text-amber-300 text-sm mb-3">
                      Before deleting your account permanently, consider these alternatives:
                    </p>
                    <div className="space-y-2">
                      <button className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-medium px-4 py-2 rounded-lg transition-colors text-left">
                        Temporarily Deactivate Account
                      </button>
                      <button className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-medium px-4 py-2 rounded-lg transition-colors text-left">
                        Download Account Data First
                      </button>
                      <button className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-medium px-4 py-2 rounded-lg transition-colors text-left">
                        Contact Support for Help
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;