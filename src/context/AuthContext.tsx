import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials — swap with API later
const VALID_USERS = [
  { username: "admin", password: "admin@123" },
  { username: "netizens", password: "netizens@2024" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(() => sessionStorage.getItem("auth_user"));

  const login = (username: string, password: string): boolean => {
    const match = VALID_USERS.find(
      (u) => u.username === username.trim() && u.password === password
    );
    if (match) {
      setUser(match.username);
      sessionStorage.setItem("auth_user", match.username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
