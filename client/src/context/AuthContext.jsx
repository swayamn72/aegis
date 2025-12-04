import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'player' or 'organization'
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      // Check if we're on admin routes
      if (window.location.pathname.startsWith('/admin')) {
        // Check for admin token
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          try {
            const response = await fetch('/api/admin/verify', {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log('Admin authenticated:', data.admin.username);
              setUserType('admin');
              setIsAuthenticated(true);
            } else {
              console.log('Admin token invalid or expired');
              localStorage.removeItem('adminToken');
            }
          } catch (error) {
            console.error('Admin auth check failed:', error);
            localStorage.removeItem('adminToken');
          }
        }
        setLoading(false);
        return;
      }

            // Regular user authentication check - only check session validity
      try {
        // Check if we have a valid session by making a lightweight request
        // We'll use a simple endpoint that just validates the token exists
        const response = await fetch('/api/players/me', {
          method: 'HEAD', // Use HEAD request to avoid fetching full data
          credentials: 'include',
        });
        
        if (response.ok) {
          setUserType('player');
          setIsAuthenticated(true);
        } else {
          // Check organization auth
          const orgResponse = await fetch('/api/organizations/profile', {
            method: 'HEAD', // Use HEAD request to avoid fetching full data
            credentials: 'include',
          });
          if (orgResponse.ok) {
            setUserType('organization');
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        // Only log actual network errors, not 401s
        if (!error.message?.includes('401')) {
          console.error('Auth check network error:', error);
        }
      } finally {
        setLoading(false);
      }


    };

    checkAuth();
  }, []);


  const login = async (email, password) => {
    try {
      setLoading(true);

      // First try player login
      let response = await fetch('/api/players/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      let isPlayer = true;

      if (!response.ok) {
        // If player login fails, try organization login
        response = await fetch('/api/organizations/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        isPlayer = false;
      }

      if (response.ok) {
        const data = await response.json();

        if (isPlayer) {
          setUserType('player');
          setIsAuthenticated(true);
          // User data will be loaded by App.jsx after navigation
        } else {
          // Organization login successful
          setUser(data.organization);
          setUserType('organization');
          setIsAuthenticated(true);
        }

        setLoading(false);
        return { success: true, userType: isPlayer ? 'player' : 'organization' };
      } else {
        const errorData = await response.json();
        setLoading(false);

        // Handle organization-specific error messages
        if (!isPlayer && response.status === 403) {
          return {
            success: false,
            message: errorData.message,
            reason: errorData.reason,
            userType: 'organization',
            status: errorData.message.includes('pending') ? 'pending' : 'rejected'
          };
        }

        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return { success: false, message: 'Network error' };
    }
  };


  const logout = async () => {
    try {
      const logoutUrl =
        userType === 'organization'
          ? '/api/organizations/logout'
          : '/api/players/logout';

      await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Organizations don't have profile updates in the current system
      if (userType === 'organization') {
        return { success: false, message: 'Organization profiles cannot be updated through this method' };
      }

      const response = await fetch('/api/players/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.player);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const refreshUser = async () => {
    try {
      const endpoint = userType === 'organization' ? '/api/organizations/profile' : '/api/players/me';
      const response = await fetch(endpoint, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const userData = userType === 'organization' ? data.organization : data;
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

   const setUserData = useCallback((userData) => {
    setUser(userData);
  }, []);



  const isProfileComplete = (userData) => {
    if (!userData) return false;
    return !!(
      userData.realName &&
      userData.age &&
      userData.location &&
      userData.country &&
      userData.primaryGame &&
      userData.teamStatus &&
      userData.availability
    );
  };

  const value = {
    isAuthenticated,
    user,
    userType,
    loading,
    login,
    logout,
    updateProfile,
    refreshUser,
    setUserData,
    isProfileComplete,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
