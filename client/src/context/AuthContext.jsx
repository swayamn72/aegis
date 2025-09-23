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
              // Admin is authenticated, but we don't set user state for admin context
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
        const response = await fetch('http://localhost:5000/api/players/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // This is expected when user is not logged in
          console.log('User not authenticated - this is normal');
        } else {
          console.error('Auth check failed with status:', response.status);
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
      const response = await fetch('http://localhost:5000/api/players/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // After login, re-fetch user data to ensure fresh state
        const checkAuth = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/players/me', {
              credentials: 'include',
            });
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              setIsAuthenticated(true);
            } else if (response.status === 401) {
              setUser(null);
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

        return { success: true };
      } else {
        const errorData = await response.json();
        setLoading(false);
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
      await fetch('http://localhost:5000/api/players/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
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
