import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockStore } from "@/lib/mockData";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  national_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, method?: "email" | "phone") => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, otp: string, method?: "email" | "phone") => Promise<{ success: boolean }>;
  register: (data: { full_name: string; email: string; phone: string; national_id: string; password: string }) => Promise<{ success: boolean }>;
  logout: () => void;
  isAdmin: boolean;
  pendingEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("mockUser");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("mockUser"); }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, method: "email" | "phone" = "email") => {
    try {
      await api.post("/auth/login", { email, password, method });
      setPendingEmail(email);
      return { success: true, message: "OTP sent! Check your email." };
    } catch (err: any) {
      // Fallback to mock for demo
      const found = mockStore.findUser(email, password);
      if (!found) throw new Error(err.response?.data?.message || "Invalid email or password");
      const u: User = { id: found.id, email: found.email, full_name: found.full_name, role: found.role, phone: found.phone, national_id: found.national_id };
      setUser(u);
      localStorage.setItem("mockUser", JSON.stringify(u));
      return { success: true, message: "Login successful!" };
    }
  };

  const verifyOtp = async (email: string, otp: string, method: "email" | "phone" = "email") => {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp, method });
      const { accessToken, refreshToken, user: userData } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      const u: User = {
        id: userData.id, email: userData.email, full_name: userData.full_name || userData.name,
        role: userData.role || "member", phone: userData.phone, national_id: userData.national_id
      };
      setUser(u);
      localStorage.setItem("mockUser", JSON.stringify(u));
      setPendingEmail(null);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Invalid OTP");
    }
  };

  const register = async (data: { full_name: string; email: string; phone: string; national_id: string; password: string }) => {
    try {
      await api.post("/auth/register", data);
      return { success: true };
    } catch {
      mockStore.registerUser(data);
      return { success: true };
    }
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("mockUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setPendingEmail(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, logout, isAdmin, pendingEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
