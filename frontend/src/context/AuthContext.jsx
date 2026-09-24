import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi";

import {
  getToken,
  removeToken,
  setToken,
} from "../utils/storage";


export const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // True while we're checking an existing login session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const handleUnauthorized = () => {
    removeToken();
    setUser(null);
  };

  window.addEventListener(
    "auth:unauthorized",
    handleUnauthorized
  );

  return () => {
    window.removeEventListener(
      "auth:unauthorized",
      handleUnauthorized
    );
  };
}, []);


  // ==========================================
  // RESTORE EXISTING SESSION
  // ==========================================

  const refreshUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();

      setUser(response.data.user);
    } catch (error) {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const {
      user: loggedInUser,
      token,
    } = response.data;

    setToken(token);
    setUser(loggedInUser);

    return response;
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (userData) => {
    const response = await registerUser(userData);

    const {
      user: registeredUser,
      token,
    } = response.data;

    setToken(token);
    setUser(registeredUser);

    return response;
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      // Backend logout is mainly semantic because
      // we're currently using client-stored JWTs.
      if (getToken()) {
        await logoutUser();
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      removeToken();
      setUser(null);
    }
  };


  // ==========================================
  // CHECK SESSION WHEN APP STARTS
  // ==========================================

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);


  const value = useMemo(
    () => ({
      user,

      loading,

      isAuthenticated: Boolean(user),

      login,

      register,

      logout,

      refreshUser,
    }),
    [user, loading, refreshUser]
  );


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};