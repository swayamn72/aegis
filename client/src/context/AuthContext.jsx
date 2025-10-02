import React, { createContext, useContext, useState, useEffect } from 'react';

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

      // Regular user authentication check
      try {
        // First check player auth
        let response = await fetch('http://localhost:5000/api/players/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserType('player');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else if (response.status !== 401) {
          console.error('Player auth check failed with status:', response.status);
        }

        // If player auth fails, check organization auth
        response = await fetch('http://localhost:5000/api/organizations/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.organization);
          setUserType('organization');
          setIsAuthenticated(true);
        } else if (response.status !== 401) {
          console.error('Organization auth check failed with status:', response.status);
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
      let response = await fetch('http://localhost:5000/api/players/login', {
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
        response = await fetch('http://localhost:5000/api/organizations/login', {
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
          // After login, re-fetch user data to ensure fresh state
          const checkAuth = async () => {
            try {
              const response = await fetch('http://localhost:5000/api/players/me', {
                credentials: 'include',
              });
              if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setUserType('player');
                setIsAuthenticated(true);
              } else if (response.status === 401) {
                setUser(null);
                setUserType(null);
                setIsAuthenticated(false);
              } else {
                console.error('Auth check failed with status:', response.status);
              }
            } catch (error) {
              if (!error.message?.includes('401')) {
                console.error('Auth check network error:', error);
              }
            } finally {
              setLoading(false);
            }
          };
          await checkAuth();
        } else {
          // Organization login successful
          setUser(data.organization);
          setUserType('organization');
          setIsAuthenticated(true);
          setLoading(false);
        }

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
          ? 'http://localhost:5000/api/organizations/logout'
          : 'http://localhost:5000/api/players/logout';

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
      const response = await fetch('http://localhost:5000/api/players/update-profile', {
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
    isProfileComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
