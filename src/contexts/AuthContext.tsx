import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockStore } from "@/lib/mockData";

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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { full_name: string; email: string; phone: string; national_id: string; password: string }) => Promise<{ success: boolean }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mockUser");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("mockUser"); }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = mockStore.findUser(email, password);
    if (!found) throw new Error("Invalid email or password");
    const u: User = { id: found.id, email: found.email, full_name: found.full_name, role: found.role, phone: found.phone, national_id: found.national_id };
    setUser(u);
    localStorage.setItem("mockUser", JSON.stringify(u));
    return { success: true, message: "Login successful!" };
  };

  const register = async (data: { full_name: string; email: string; phone: string; national_id: string; password: string }) => {
    const newUser = mockStore.registerUser(data);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("mockUser");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
