import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "streamwave_user";
const PROFILE_KEY = "streamwave_profile";

const readCookie = (key) => {
  if (typeof document === "undefined") return null;
  const entry = document.cookie.split("; ").find((item) => item.startsWith(`${key}=`));
  if (!entry) return null;
  try {
    return JSON.parse(decodeURIComponent(entry.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
};

const readStoredJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || sessionStorage.getItem(key) || "null") || readCookie(key);
  } catch {
    return readCookie(key);
  }
};

const writeStoredJson = (key, value) => {
  const encoded = JSON.stringify(value);
  localStorage.setItem(key, encoded);
  sessionStorage.setItem(key, encoded);
  document.cookie = `${key}=${encodeURIComponent(encoded)}; Max-Age=2592000; Path=/; SameSite=Lax`;
};

const removeStoredJson = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
  document.cookie = `${key}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredJson(USER_KEY));
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(() => readStoredJson(PROFILE_KEY));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    api.get("/auth/me")
      .then(({ data }) => {
        const nextProfiles = data.profiles || [];
        const savedProfile = readStoredJson(PROFILE_KEY);
        const savedForUser = nextProfiles.find((profile) => profile._id === savedProfile?._id);
        const namedProfile = nextProfiles.find((profile) => profile.name === data.user?.name);
        const nextProfile = savedForUser || namedProfile || nextProfiles[0] || null;

        setProfiles(nextProfiles);
        if (nextProfile) {
          setActiveProfile(nextProfile);
          writeStoredJson(PROFILE_KEY, nextProfile);
        } else {
          removeStoredJson(PROFILE_KEY);
          setActiveProfile(null);
        }
      })
      .catch(() => logout());
  }, [user?.token]);

  const persist = (data) => {
    const previousUser = readStoredJson(USER_KEY);
    if (previousUser?._id && previousUser._id !== data?._id) {
      removeStoredJson(PROFILE_KEY);
      setActiveProfile(null);
    }
    writeStoredJson(USER_KEY, data);
    setUser(data);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      if (data?.token) persist(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStoredJson(USER_KEY);
    removeStoredJson(PROFILE_KEY);
    setUser(null);
    setProfiles([]);
    setActiveProfile(null);
  };

  const switchProfile = (profile) => {
    setActiveProfile(profile);
    writeStoredJson(PROFILE_KEY, profile);
  };

  const value = useMemo(
    () => ({ user, profiles, activeProfile, loading, login, register, logout, switchProfile, setProfiles }),
    [user, profiles, activeProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
